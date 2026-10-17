var DiscoveryVirshSensor = Class.create();

/**
*  To be used with probes running against the virtualization platform CI
*/
DiscoveryVirshSensor.prototype = Object.extendsObject(DiscoverySensor, {
   
	/**
	* Tell the sensor which tables to load the data into:
	* serverTable - subclass of cmdb_ci_vm or cmdb_ci_virtualization_server (the *current* CI in this context)
	*    expected fields: linux_host, details_xml
	* instanceTable - subclass of cmdb_ci_vm_instance, 
	*    expected fields: details_xml
	* deviceTable - holds records for <devices> for a domain
	*    expected fields: vm_instance, device, type, details_xml
	* networkTable - subclass of cmdb_ci_vm_object
	*    expected fields: forward_mode, bridge, details_xml
	* poolTable - subclass of cmdb_ci_vm_object, details_xml
	*    expected fields: capacity, allocation, available, path
	* volumeTable - cmdb_ci_vm_object
	*    expected fields: storage_pool, capacity, allocation, path
	*/
	setTables: function(serverTable, instanceTable, deviceTable, networkTable, poolTable, volumeTable) {
		this.serverTable = serverTable;
		this.instanceTable = instanceTable;
		this.deviceTable = deviceTable;
		this.networkTable = networkTable;
		this.poolTable = poolTable;
		this.volumeTable = volumeTable;
	},
	
	getVirtPlatformCi: function() {
		return this.getCmdbRecord();
	},
	
	/**
	* Parse <domains> xml, containing:
	* 1) <domain_list> containing output from command "virsh list --all"
	* 2) <domain>'s containing output from "virsh dumpxml"
	* 3) <disk_data>'s containing output from "virsh domblkinfo"
	*/
	parseDomainListOutput: function(output) {
		
		var xmlHelper = new XMLHelper();
		var xmlResult = xmlHelper.toObject(output);
		
		var domainList = g_array_util.ensureArray(xmlResult.domain);
		var diskDataList = g_array_util.ensureArray(xmlResult.disk_data);
		
		//Some data structures for stashing away data for later look-up
		var domainStates = {};	 //maps vm name -> state (running, stopped, etc)
		var diskSizes = {};		//maps disk file path -> capacity
		
		//Pull out vm states into our domainStates data structure
		var lines = xmlResult.domain_list.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var fields = /^\s*\S+\s+(\S+)\s+(.+)$/.exec(lines[i]);
			if (fields && fields[1] && fields[2]) 
				domainStates[fields[1]] = fields[2]; //name -> state
		}
		
		//Pull out the disk capacity stuff into our diskSizes data structure
		for (var i = 0; i < diskDataList.length; i++) {
			var file = diskDataList[i]['@file'];
			var diskData = diskDataList[i]['#text'];
			var match = /Capacity:\s+([0-9]+)/.exec(diskData);
			if (match && match[0] && match[1])
				diskSizes[file] = match[1];
		}
		
		var discoveredVms = [];
		
		//Start pulling in each <domain> element
		for (var i = 0; i < domainList.length; i++) {
			var domain = domainList[i];
			var objectId = domain.uuid;
			
			var instanceSysId;
			var doUpdate;
			
			var gr = new GlideRecord(this.instanceTable);
			gr.addQuery("object_id", objectId);
			gr.query();
			
			if (!gr.next()) {
				doUpdate = false;
				gr.initialize();
				gr.object_id = objectId;
			}
			else {
				doUpdate = true;
				instanceSysId = gr.sys_id;	
			}
			
			var memKB = domain.memory['#text'];
			var cpus = domain.vcpu['#text'];
			
			//Deal with some funky stuff from XMLHelper's toObject 
			//  ("#text" may or may not be there)
			if (!memKB)
				memKB = domain.memory;
			
			if (!cpus)
				cpus = domain.vcpu;
			
			gr.name = domain.name;
			gr.state = this.mapState(domainStates[domain.name]);
			gr.cpus = cpus;
			gr.memory = memKB/1024; //KB -> MB
			
			gr.details_xml = xmlHelper.toXMLStr({domain:domain});
			
			//Process devices/disk[@device='disk'] elements
			var diskList = g_array_util.ensureArray(domain.devices.disk);
			var diskCount = 0;
			var diskSize = 0;
			for (var j = 0; j < diskList.length; j++) {
				if (diskList[j]["@device"] == "disk") {
					diskCount++;
					var file = diskList[j].source['@file'];
					diskSize += diskSizes[file];
				}
			}
			
			gr.disks = diskCount;
			gr.disks_size = Math.round(diskSize/(1024*1024*1024)) || 0; //Bytes -> GB
			
			
			//Process devices/interface elements
			var nicList = g_array_util.ensureArray(domain.devices["interface"]);
			gr.nics = nicList.length;
			
			
			if (doUpdate)
				gr.update();
			else
				instanceSysId = gr.insert();

			var sourceName = gs.getProperty('glide.discovery.source_name', "ServiceNow");
			var os = new ObjectSource(sourceName, gr.sys_class_name, gr.sys_id);
			os.setValue("last_scan", new GlideDateTime().getDisplayValue());
			os.process();

			//Keep track of the VM's we see
			discoveredVms.push(gr.getUniqueValue());
			
			//Registered-on relationship between vm instance and virtualization platform 
			var virtCi = this.getVirtPlatformCi();
			if (virtCi)
				g_disco_functions.createRelationshipIfNotExists(gr, virtCi, "Registered on::Has registered");
			
			//Sync up the devices list for this domain
			var macList = []; //hang on to the mac addresses 
			var networkList = []; // and networks
			var storageList = []; // and storage volumes
			
			var devGr = new GlideRecord(this.deviceTable);
			devGr.addQuery("vm_instance", instanceSysId);
			devGr.deleteMultiple();
			
			for (var d in domain.devices) {
				if (d == 'emulator')
					continue;
				
				var devArray = g_array_util.ensureArray(domain.devices[d]); 
				for (var j=0; j < devArray.length; j++) {
					devGr.initialize();
					devGr.vm_instance = instanceSysId;
					devGr.device = d;
					devGr.type = devArray[j]['@type'];					
					
					var xml = {};
					xml[d] = devArray[j]; //so we get the root element name correct in toXMLStr below
					devGr.details_xml = xmlHelper.toXMLStr(xml);
					
					
					var deviceType = ""+devArray[j]['@type'];
					
					//Stash mac if this is a network interface
					if(d == "interface" && (deviceType == "network" || deviceType == "bridge")) {
						if(devArray[j].mac && devArray[j].mac['@address']) {
							macList.push(devArray[j].mac['@address']);
							devGr.id = devArray[j].mac['@address'];
						}
						if(devArray[j].source && devArray[j].source["@network"])
							networkList.push(devArray[j].source["@network"]);
					}
					
					//For disks, grab the source/@file info for the id field
					if(d == "disk" && deviceType == "file") {
						if(devArray[j].source && devArray[j].source["@file"]) {
							storageList.push(devArray[j].source["@file"]);
							devGr.id = devArray[j].source["@file"];
						}
					}
					
					devGr.insert();
				}
			}
			
			//Link up any computer CI's that might be in the database
			if(macList[0]) {
				var adapterGr = new GlideRecord("cmdb_ci_network_adapter");
				var computerCi = new GlideRecord("cmdb_ci_computer");
				adapterGr.addQuery("mac_address", macList);
				adapterGr.addQuery("install_status", "!=", 100); //Exclude absent NICs
				adapterGr.query();
				
				if(adapterGr.next()) {
					g_disco_functions.createRelationshipIfNotExists(gr, adapterGr.cmdb_ci, "Instantiates::Instantiated by");
					g_disco_functions.createRelationshipIfNotExists(adapterGr.cmdb_ci, virtCi, "Virtualized by::Virtualizes");
					
					computerCi.get(adapterGr.cmdb_ci);
					if(!computerCi.virtual) {
						computerCi.virtual = true;
						computerCi.update();
					}
						
				}
			}
			
			//And any "connected-by" action w/ networks
			var connectedBy = [];
			if(networkList[0]) {
				for(var j = 0; j < networkList.length; j++) {
					var netGr = new GlideRecord(this.networkTable);
					netGr.addQuery("name", networkList[j]);
					netGr.query();
					if(netGr.next()) {
						//make sure this is w/ the correct kvm server (different kvm's can have networks w/ same name)
						var relGr = new GlideRecord("cmdb_rel_ci");
						relGr.addQuery("parent", netGr.sys_id);
						relGr.addQuery("type", "4afd799338a02000c18673032c71b817"); //Provided by
						relGr.addQuery("child", virtCi.sys_id);
						relGr.query();
						if(relGr.next()) {
							g_disco_functions.createRelationshipIfNotExists(gr, netGr, "Connected by::Connects");
							connectedBy.push(""+netGr.sys_id);
						}
					}
				}
			}
			
			//Clean-up connected-by's that are no longer valid.
			var relGr = new GlideRecord("cmdb_rel_ci");
			relGr.addQuery("parent", gr.sys_id); //VM instance
			relGr.addQuery("type", "3deab95338a02000c18673032c71b876"); //Connected by
			relGr.addQuery("child", "NOT IN", connectedBy); //virtual network
			relGr.deleteMultiple();
			
			
			//And any storage pool relationships
			var storedOn = [];
			for(var j = 0; j < storageList.length; j++) {
				var volGr = new GlideRecord(this.volumeTable);
				volGr.addQuery("path",storageList[j]);
				volGr.query();
				if(volGr.next()) {
					//make sure the storage pool is for this KVM 
					var relGr = new GlideRecord("cmdb_rel_ci");
					relGr.addQuery("parent", volGr.storage_pool);
					relGr.addQuery("type", "de5aeb6a0ab3015854626f204fb7b1c0"); //Defines resources for
					relGr.addQuery("child", virtCi.sys_id);
					relGr.query();
					if(relGr.next()) {
						g_disco_functions.createRelationshipIfNotExists(volGr.storage_pool, gr, "Provides storage for::Stored on");
						storedOn.push(''+volGr.storage_pool);
					}
				}
			}
			
			//clean up any storage pool/vm instance relationships
			relGr.initialize();
			relGr.addQuery("parent", "NOT IN", storedOn); //storage pool
			relGr.addQuery("type", "c6fd799338a02000c18673032c71b81d"); //Provides storage for
			relGr.addQuery("child", gr.sys_id); //vm instance
			relGr.deleteMultiple();
		}
		
		
		//Remove any instances that have been deleted since the last discovery
		// that is instanceTable records that have registered-on relationship w/ virtCi, 
		// but are NOT in our discoveredVms list.
		this.reconcileCiRels(this.instanceTable, discoveredVms, "aa9434870ab301544ce2943bf03fd7a8");
		
    },

	
	/**
	* Parse <networks> xml, containing:
	* 1) <network_list> containing output from command "virsh net-list --all"
	* 2) <network>'s containing output from "virsh net-dumpxml"
	*/
	parseNetworkListOutput: function(output) {
		
		var xmlHelper = new XMLHelper();
		var xmlResult = xmlHelper.toObject(output);
		
		var networkStates = {};	 //maps network name -> state (active/inactive)
			
		//Pull out network states into our networkStates data structure
		var lines = xmlResult.network_list.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var fields = /^\s*(\S+)\s+(\S+)\s+.*$/.exec(lines[i]);
			if (fields && fields[1] && fields[2]) 
				networkStates[fields[1]] = fields[2]; //name -> state
		}
		
		
		//Pull in each <network> element
		var discoveredNetworks = [];
		var networkList = g_array_util.ensureArray(xmlResult.network);
		for (var i = 0; i < networkList.length; i++) {
			var networkElem = networkList[i];
			var objectId = networkElem.uuid;
			
			var doUpdate = true;
			var gr = new GlideRecord(this.networkTable);
			gr.addQuery("object_id", objectId);
			gr.query();
			
			if (!gr.next()) {
				doUpdate = false;
				gr.initialize();
				gr.object_id = objectId;
			}
			
			gr.name = networkElem.name;			
			gr.state = networkStates[networkElem.name];
			
			if(networkElem.forward)
				gr.forward_mode = networkElem.forward['@mode'];
			if(networkElem.bridge)
				gr.bridge = networkElem.bridge['@name'];
			
			gr.details_xml = xmlHelper.toXMLStr({network: networkElem});
			
			if (doUpdate)
				gr.update();
			else
				gr.insert();
			
			discoveredNetworks.push(gr.getUniqueValue());
			
			//Provided-by relationship between network and virtualization platform 
			var virtCi = this.getVirtPlatformCi();
			if (virtCi)
				g_disco_functions.createRelationshipIfNotExists(gr, virtCi, "Provided By::Provides");
			
		}
		
		// remove networkTable records that have Provided By relationship w/ virtCi, 
		// but are NOT in our discoveredNetworks list.
		this.reconcileCiRels(this.networkTable, discoveredNetworks, "4afd799338a02000c18673032c71b817");
		
	},
	
	/**
	* Parse <storage_pools> xml, containing:
	* 1) <pool_list> containing output from command "virsh pool-list --all"
	* 2) <poolio>'s containing output from "virsh pool-dumpxml" followed by "<volume>" output from respective "virsh vol-dumpxml"
	*/
	parseStoragePoolListOutput: function(output) {
		var xmlHelper = new XMLHelper();
		var xmlResult = xmlHelper.toObject(output);
		
		var poolStates = {};	 //maps pool name -> state (active/inactive)
			
		//Pull out network states into our networkStates data structure
		var lines = xmlResult.network_list.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var fields = /^\s*(\S+)\s+(\S+)\s+.*$/.exec(lines[i]);
			if (fields && fields[1] && fields[2]) 
				poolStates[fields[1]] = fields[2]; //name -> state
		}
		
		//Pull in each <pool> element
		var discoveredPools = [];
		var poolioList = g_array_util.ensureArray(xmlResult.poolio);
		for (var i = 0; i < poolioList.length; i++) {
			var poolElem = poolioList[i].pool;
			var objectId = poolElem.uuid;
			
			var doUpdate = true;
			var poolGr = new GlideRecord(this.poolTable);
			poolGr.addQuery("object_id", objectId);
			poolGr.query();
			
			if (!poolGr.next()) {
				doUpdate = false;
				poolGr.initialize();
				poolGr.object_id = objectId;
			}
			
			poolGr.name = poolElem.name;
			poolGr.state = poolStates[poolElem.name];
			
			var capacity = this._getText(poolElem.capacity);
			var allocation = this._getText(poolElem.allocation);
			var available = this._getText(poolElem.available);
			
			if(capacity)
				poolGr.capacity = capacity/1048576;
			if(allocation)
				poolGr.allocation = allocation/1048576;
			if(available)
				poolGr.available = available/1048576;
			if(poolElem.target)
				poolGr.path = poolElem.target.path;
			
			poolGr.details_xml = xmlHelper.toXMLStr({pool: poolElem});
			
			if (doUpdate)
				poolGr.update();
			else
				poolGr.insert();
			
			discoveredPools.push(poolGr.getUniqueValue());
			
			//Defines-resources-for relationship between pool and virtualization platform 
			var virtCi = this.getVirtPlatformCi();
			if (virtCi)
				g_disco_functions.createRelationshipIfNotExists(poolGr, virtCi, "Defines resources for::Gets resources from");
			
			//Pull in the volumes for this pool
			var volList = g_array_util.ensureArray(poolioList[i].volume);
			var volSysIds = [];
			for (var j = 0; j < volList.length; j++) {
				var volElem = volList[j];
				
				var volGr = new GlideRecord(this.volumeTable);
				
				volGr.addQuery("name", volElem.name);
				volGr.addQuery("storage_pool", poolGr.sys_id);
				volGr.query();
				
				if (!volGr.next()) {
					doUpdate = false;
					volGr.name = volElem.name;
					volGr.storage_pool = poolGr.sys_id;
				}
				else {
					doUpdate = true;
					volSysIds.push(volGr.sys_id);
				}
				
				var capacity = this._getText(volElem.capacity);
				var allocation = this._getText(volElem.allocation);
				
				if(capacity)
					volGr.capacity = capacity/1048576;
				if(allocation)
					volGr.allocation = allocation/1048576;
				if (volElem.target)
					volGr.path = volElem.target.path;
				
				volGr.details_xml = xmlHelper.toXMLStr({volume: volElem});
				
				if (doUpdate)
					volGr.update();
				else
					volSysIds.push(volGr.insert());
				
				//Provides-storage-for relationships between pool and vm instances
				var devGr = new GlideRecord(this.deviceTable);
				devGr.addQuery("id", volGr.path);
				devGr.query();
				while(devGr.next()) {
					g_disco_functions.createRelationshipIfNotExists(poolGr, devGr.vm_instance, "Provides storage for::Stored on");
				}
			}
			
			//Clean up storage volumes that are no longer present
			var volGr = new GlideRecord(this.volumeTable);
			volGr.addQuery("storage_pool", poolGr.sys_id);
			volGr.addQuery("sys_id", "NOT IN", volSysIds);
			volGr.deleteMultiple();
			
			
		}
		
		// remove poolTable records that have "Defines resources for" relationship w/ virtCi, 
		// but are NOT in our discoveredPools list.
		this.reconcileCiRels(this.poolTable, discoveredPools, "de5aeb6a0ab3015854626f204fb7b1c0");
		
	},
	
	//Deal with some funky stuff from XMLHelper's toObject ("#text" may or may not be there)
	_getText: function(node) {
		if(!node)
			return node;
		
		var nodeText = node['#text'];
		if(!nodeText)
			return node;
		return nodeText;
	},
	
	/**
	* map domain (VM) state from what virsh gives us to what cmdb_ci_vm_instance.state expects
	*/
	mapState: function(s) {
		return {
			'running':'on',
			'idle':'on',
			'shut off':'off',
			'paused':'paused',
			'pmsuspended':'paused',
			'shutdown':'stopping',
			'crashed':'error',
			'dying':'terminating'
		}[s];
	},
	
		
	reconcileCiRels: function(parentTable, parentList, relationType) {
		//Remove any instances that have been deleted since the last discovery
	   var relGr = new GlideRecord("cmdb_rel_ci");
	   relGr.addQuery("type", relationType); 
	   relGr.addQuery("parent", "NOT IN", parentList);
	   relGr.addQuery("child", this.getVirtPlatformCi().getUniqueValue());
	   relGr.query();
	   
	   var toDelete = [];
	   while(relGr.next()) {
		  toDelete.push(""+relGr.parent);
	   }
	   
	   var parentGr = new GlideRecord(parentTable);
	   parentGr.addQuery("sys_id", toDelete);
	   parentGr.query();
	   parentGr.deleteMultiple();
	},
	
    type: "DiscoveryVirshSensor"
});
