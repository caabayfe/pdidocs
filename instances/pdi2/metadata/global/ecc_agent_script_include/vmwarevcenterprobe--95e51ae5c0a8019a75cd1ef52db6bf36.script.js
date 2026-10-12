ArrayPolyfill;

var VMWarevCenterProbe = Class.create();

(function() {

var getWWNString = Packages.com.service_now.mid.probe.VMWareProbe.getWWNString,
	v4 = /[0-9]{1,3}(\.[0-9]{1,3}){3}/,
	masks = [
		'0.0.0.0',
		'128.0.0.0',       '192.0.0.0',       '224.0.0.0',       '240.0.0.0',
		'248.0.0.0',       '252.0.0.0',       '254.0.0.0',       '255.0.0.0',
		'255.128.0.0',     '255.192.0.0',     '255.224.0.0',     '255.240.0.0',
		'255.248.0.0',     '255.252.0.0',     '255.254.0.0',     '255.255.0.0',
		'255.255.128.0',   '255.255.192.0',   '255.255.224.0',   '255.255.240.0',
		'255.255.248.0',   '255.255.252.0',   '255.255.254.0',   '255.255.255.0',
		'255.255.255.128', '255.255.255.192', '255.255.255.224', '255.255.255.240',
		'255.255.255.248', '255.255.255.252', '255.255.255.254', '255.255.255.255' ];

VMWarevCenterProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
        this.debug('Starting vCenter discovery...');
        this.vCenter = {};

        // Object data to fetch
        this.datacenters = [];
        this.folders = [];
        this.clusters = [];
        this.hosts = [];
        this.vmInstances = [];
        this.resourcePools = [];
        this.networks = [];
        this.datastores = [];

        // Relationships between the objects we fetch
        this.hostVmRel = {};
        this.networkVmRel = {};
        this.networkHostRel = {};
        this.datastoreVmRel = {};
        this.datastoreHostRel = {};
        this.hostClusterRel = {};
        this.resourcePoolClusterRel = {};
        this.resourcePoolHostRel = {};
        this.folderRel = {};
        this.datacenterNetworkRel = {};
        this.datacenterVmRel = {};
        this.datacenterHostRel = {};
        this.datacenterDatastoreRel = {};

        // Special purpose objects
        this.processedDatastores = {};
        this.processedNetworks = {};
        this.processedClusters = {};
        this.hostParent = {};

        if (!this.processvCenter())
			return;

        this.debug('Fetching and processing managed entities');
        this.processManagedEntities('Datacenter', this.processDatacenter, this);
        this.processManagedEntities('Folder', this.processFolder, this);
        this.processManagedEntities('ClusterComputeResource', this.processCluster, this);
        this.processManagedEntities('HostSystem', this.processHostSystem, this);
        this.processManagedEntities('ResourcePool', this.processResourcePool, this);
        this.processManagedEntities('VirtualMachine', this.processVirtualMachine, this);

        this.debug('Generating XML payload');
        this.generateXMLPayload();
    },

	// returns false if error
    processvCenter : function() {
        var props = ['content.about.instanceUuid',
                     'content.about.apiVersion', 
                     'content.about.fullName', 
                     'content.about.name', 
                     'content.about.version'];
		
        // If older than 2.5, content.about.instanceUuid does not exist and will throw an InvalidProperty exception
        var o = {};
        try {
            o = this.processObjectProperties(props, this.serviceInstance);
        } catch (e) {
            props = ['content.about.apiVersion', 
                     'content.about.fullName', 
                     'content.about.name', 
                     'content.about.version'];
            o = this.processObjectProperties(props, this.serviceInstance);
        }
		
		// Error if vCenter version too old.
		var vCenterMinApiVersion = "4.1";
		var vc = new Packages.com.service_now.mid.util.VersionComparator();
		if (vc.compare(vCenterMinApiVersion, o.obj['content.about.apiVersion']) < 0) {
			this.setError("vCenter version " + o.obj['content.about.apiVersion'] + " is not supported.  Only " + vCenterMinApiVersion + " or newer is supported");
			return false;
		}	

        o.obj['url'] = '' + this.serviceInstance.getServerConnection().getUrl();
        this.vCenter = o.obj;
		return true;
    },

    processDatacenter: function(datacenter, thisObj) {
        var props = ['name',
                     'network',
                     'vmFolder',
                     'hostFolder',
                     'datastore'];
        var o = thisObj.processObjectProperties(props, datacenter);

        var networks = o.propvals.get('network') || [];
        for (var i = 0; i < networks.length; i++) {
            var network = new vim25.mo.Network(thisObj.serviceInstance.getServerConnection(), networks[i]);
            thisObj.processNetwork(network, thisObj);
        }

        thisObj.processRelationship('network', o, thisObj.datacenterNetworkRel, thisObj);
        thisObj.processRelationship('datastore', o, thisObj.datacenterDatastoreRel, thisObj);
        thisObj.processRelationshipSubFolder('vmFolder', o, thisObj.datacenterVmRel, thisObj);
        thisObj.processRelationshipSubFolder('hostFolder', o, thisObj.datacenterHostRel, thisObj);

        thisObj.datacenters.push(o.obj);

		// PRB647166: A bug in vijava doesn't let us get datastores from the top level object with
		// vSphere 6.0.  Get datastores via their association to datacenters instead.
		var datastores = o.propvals.get('datastore') || [];
		for (i = 0; i < datastores.length; i++) {
			var datastore = new vim25.mo.Datastore(thisObj.serviceInstance.getServerConnection(), datastores[i]);
			thisObj.processDatastore(datastore, thisObj);
		}
    },

    processFolder: function(folder, thisObj) {
        var props = ['name',
                     'parent',
                     'childEntity',
					 'childType'];
        var o = thisObj.processObjectProperties(props, folder);

        var parent = o.propvals.get('parent');
        if (parent) {
            var managedEntity = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), parent);
            o.obj['parent'] = managedEntity.getMOR().val;
        } else
            o.obj['parent'] = '';

        thisObj.processRelationship('childEntity', o, thisObj.folderRel, thisObj);
		
		var childTypes = o.propvals.get('childType') || [];
		o.obj['folderType'] = [];
		for (var i = 0; i < childTypes.length; i++) {
			var childType = {};
			childType['childType'] = childTypes[i];
			o.obj['folderType'].push(childType);
		}
		
        thisObj.folders.push(o.obj);
    },
	
	processDatastore : function(dataStore, thisObj) {		
		var props = ['summary.accessible',
                     'summary.capacity', 
                     'summary.freeSpace', 
                     'summary.name', 
                     'summary.type', 
                     'summary.url',
                     'vm',
                     'host',
					 'capability.perFileThinProvisioningSupported'];

        var o = thisObj.processObjectProperties(props, dataStore);
		o.obj['datastoreHostMount'] = [];

        var hostMounts = o.propvals.get('host') || [];
			
		// Get the host mount info
        for (var i = 0; i < hostMounts.length; i++) {
        	if (hostMounts[i] instanceof vim25.DatastoreHostMount)
				thisObj.processDataStoreHostMount(hostMounts[i], o.obj);		
        }

        var datastoreInfo = dataStore.getInfo();
        
        if (datastoreInfo instanceof vim25.VmfsDatastoreInfo) 
            thisObj.processDataStoreHostDisks(datastoreInfo, o.obj);
			
        thisObj.datastores.push(o.obj);
        thisObj.processRelationship('vm', o, thisObj.datastoreVmRel, thisObj);
    },
	
    processCluster: function(cluster, thisObj) {
        var props = ['name',
                     'summary.numHosts', 
                     'summary.totalMemory', 
                     'summary.totalCpu',
                     'summary.numEffectiveHosts',
                     'summary.numCpuThreads',
                     'summary.numCpuCores',
                     'summary.effectiveCpu',
                     'summary.effectiveMemory',
                     'parent'];
        var o = thisObj.processObjectProperties(props, cluster);

        var parent = o.propvals.get('parent');
        var managedEntity = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), parent);
        o.obj['parent'] = managedEntity.getMOR().val;

        thisObj.processedClusters[o.obj.morid] = 1;

        thisObj.clusters.push(o.obj);
    },

    processHostSystem : function(hostSystem, thisObj) {
        var props = ['summary.hardware.uuid',
                     'summary.hardware.cpuMhz', 
                     'summary.hardware.model', 
                     'summary.hardware.memorySize', 
					 'summary.hardware.numCpuPkgs', 
                     'summary.hardware.numCpuCores', 
                     'summary.hardware.vendor', 
                     'summary.hardware.cpuModel',
					 'runtime.inMaintenanceMode',
                     'hardware.cpuPkg',
                     'name',
                     'datastore',
                     'vm',
                     'parent'];

        var o = thisObj.processObjectProperties(props, hostSystem),
        	obj = o.obj;

        //resolve the host name into an ip address; append to o.obj
        var hostName = o.propvals.get('name');
        var ips = new Packages.com.snc.commons.networks.IPHost(hostName).resolveAddress();
        if (ips.length > 0) {
        	o.obj.ip = ips[0].toString();
        }

        // Get the first CPU to determine the manufacturer
        var cpuPkg = o.propvals.get('hardware.cpuPkg')[0];
        o.obj['hardware.cpuPkg.vendor'] = cpuPkg.getVendor();

		var parmValue = (probe.getParameter('vCenter.getSANStorageInfo') || '') + '';
        // Get the disks on this host
		if (parmValue == 'true')
			getMultipathInfo();

		// Get the serial number
		getSerialNumber();

        // For the purpose of building resource pool relationships
        var parent = o.propvals.get('parent');
        var managedEntity = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), parent);
        o.obj['parent'] = managedEntity.getMOR().val;
        thisObj.hostParent[o.obj.morid] = '' + managedEntity.getMOR().val;

        thisObj.processRelationship('datastore', o, thisObj.datastoreHostRel, thisObj);
        thisObj.processRelationship('vm', o, thisObj.hostVmRel, thisObj);
        thisObj.processSingleRelationship('parent', o, thisObj.hostClusterRel, thisObj);
        thisObj.hosts.push(o.obj);

		function getSerialNumber() {
			var sn = { },
				toGet = {
					Config: {
						Product: {
							FullName: ''
						}
					},
					Hardware: {
						SystemInfo: {
							OtherIdentifyingInfo: [{
								IdentifierType: {
									Key: ''
								},
								IdentifierValue: ''
							}]
						}
					}
				};

			getVCenterObject(hostSystem, sn, toGet);
			obj.sn = JSON.stringify(sn);
		}

		function getMultipathInfo() {
			// Doc: http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.host.StorageDeviceInfo.html
			var config = hostSystem.getConfig(),
				storageDevice = config.getStorageDevice(),
				mpi = { },
				toGet = {
					ScsiLun: [{			 // The list of SCSI logical units available on the host. 
						CanonicalName: '',  // Canonical name of the SCSI logical unit.
											// Disk partition or extent identifiers refer to this name when referring to a disk.
											// Use this property to correlate a partition or extent to a specific SCSI disk.
						Capacity: {
							Block: 0,
							BlockSize: 0
						},
						Uuid: '',			// Universally unique identifier for the LUN used to identify ScsiLun across multiple servers.
						DisplayName: '',
						Model: '',
						Vendor: ''
					}],
					// a storage entity that represents a topological path from a host bus adapter to a SCSI logical unit.
					// Each path is unique although each host bus adapter/SCSI logical unit pair can have multiple paths.
					MultipathInfo: {		// The multipath configuration that controls multipath policy for ScsiLuns.
											// This data object exists only if path information is available and is configurable. 
						Lun: [ {			// List of logical units that can be configured for multipathing. 
							Id: '',			// Identifier of LogicalUnit.  Use this id to configure LogicalUnit multipathing policy
							Key: '',			// Linkable identifier. 
							Lun: '',			// SCSI device corresponding to logical unit.
							Path: [ {			// Array of paths available to access this LogicalUnit. 
								Adapter: '',	// The host bus adapter at one endpoint of this path. 
								Transport: {		// Transport information for the target end of the path. 
									NodeWorldWideName: '',	// FC: The world wide node name of the target. 
									PortWorldWideName: '',	// FC: The world wide port name of the target. 
									IScsiName: ''			// iSCSI: The iSCSI name of the target. 
								}
							} ]
						} ]
					},
					HostBusAdapter: [{		 // The list of host bus adapters available on the host. 
						Key: '',			   // The linkable identifier. 
						Model: '',			 // The model name of the host bus adapter. 
						IScsiName: '',			// ISCSI: The iSCSI name of this host bus adapter.
						ConfiguredStaticTarget: [{	// ISCSI: The configured iSCSI static target entries.
							Address: '',			// The IP address or hostname of the storage device.
							IScsiName: ''			// The iSCSI name of the storage device.
						}],

						Device: '',			// The device name of host bus adapter.
						NodeWorldWideName: '',	// FC: The world wide node name for the adapter. 
						PortType: '',			 // FC: The type of the fiber channel port. 
						PortWorldWideName: '',	// FC: The world wide port name for the adapter. 
						Speed: '',				// FC: The current operating speed of the adapter in bits per second. 
						MaxSpeedMb: '',			// ISCSI: The maximum supported link speed of the port in megabits per second.
						IpProperties: {			// ISCSI: The IP settings for this host bus adapter. 
							Address: '',			// The current IPv4 address. 
							Mac: ''				// The MAC address. 
						}
					}],
				},
			toGetVnic = [ {
				Device: '',
				Spec: {
					ExternalId: '',
					Mac: '',
					Ip: {
						Dhcp: '',
						IpAddress: '',
						SubnetMask: ''
					}
				}
			} ],
			toGetForNic = {
				Network: {
					Pnic: [ {
						Device: '',
						Mac: '',
						Spec: {
							Ip: {
								Dhcp: '',
								IpAddress: '',
								SubnetMask: ''
							}
						}
					} ],
					ConsoleVnic: toGetVnic,
					Vnic: toGetVnic
				}
			};
	
			getVCenterObject(storageDevice, mpi, toGet);
			getVCenterObject(config, mpi, toGetForNic);
			
			obj.mpi = JSON.stringify(mpi);
			
		}
	},

	processDataStoreHostMount : function(hostMount, dataStoreObj) {
		
        var hostSystem = new vim25.mo.ManagedEntity(this.serviceInstance.getServerConnection(), hostMount.getKey());
		var hostmountinfo = {};
        hostmountinfo['hostSystemMorId'] = '' + hostSystem.getMOR().val;
		
		var mountInfo = hostMount.getMountInfo();
		hostmountinfo['mountInfo.accessible'] = '' + mountInfo.getAccessible();
		hostmountinfo['mountInfo.accessMode'] = '' + mountInfo.getAccessMode();

        dataStoreObj['datastoreHostMount'].push(hostmountinfo);
    },

    processDataStoreHostDisks : function(datastoreInfo, dataStoreObj) {
        dataStoreObj['datastoreDisk'] = []; 

        var vmfs = datastoreInfo.getVmfs();
        var scsiDiskPartitions = vmfs.getExtent();

        for (var i = 0; i < scsiDiskPartitions.length; i++) {
            var datastoreDiskInfo = {};
            datastoreDiskInfo['name'] = '' + scsiDiskPartitions[i].getDiskName();
            dataStoreObj['datastoreDisk'].push(datastoreDiskInfo);
        }
    },

    processVirtualMachine : function(virtualMachine, thisObj) {
        var nic,
			guest = { },
			toGet = {
				guest: {
					ipAddress: 'ipAddress',
					ipStack: [ {
						ipRouteConfig: {
							ipRoute: [ {
								prefixLength: 'prefixLength',
								gateway: {
									device: 'device',
									ipAddress: 'ipAddress'
								}
							} ]
						}
					} ],
					net: [ {
						macAddress: 'macAddress',
						dnsConfig: [ { ipAddress: 'ipAddress' } ],
						ipConfig: {
							dhcp: {
								ipv4: {
									enable: function(value, o) { o.enable = !!value.isEnable(); }
								},
								ipv6: {
									enable: function(value, o) { o.enable = !!value.isEnable(); }
								}
							},
							ipAddress: [ {
								ipAddress: 'ipAddress',
								prefixLength: 'prefixLength'
							} ]
						}
					} ]
				}
			},
			props = ['config.hardware.numCPU',
                     'config.hardware.memoryMB', 
                     'config.uuid',
					 'config.instanceUuid',
                     'config.files.vmPathName', 
                     'config.template',
					 'config.guestId',
                     'runtime.powerState', 
                     'name', 
                     'config.hardware.device',
                     'network'];

        var o = thisObj.processObjectProperties(props, virtualMachine);
        o.obj['runtime.powerState'] = o.propvals.get('runtime.powerState').toString();

        o.obj['virtualDisk'] = [];
		o.obj.virtualMac = [ ];

        thisObj.processRelationship('network', o, thisObj.networkVmRel, thisObj);

        var virtualDevices = o.propvals.get('config.hardware.device') || [];

		getVCenterObject(virtualMachine, guest, toGet);

		// Get disk info from the devices
        for (var i = 0; i < virtualDevices.length; i++) {
            if (virtualDevices[i] instanceof vim25.VirtualDisk)
                thisObj.processVirtualDisk(virtualDevices[i], o.obj);
			else if (virtualDevices[i] instanceof vim25.VirtualEthernetCard) {
				nic = thisObj.extractNic(virtualDevices[i], guest && guest.guest);
				o.obj.virtualMac.push(nic);
			}
		}

		thisObj.vmInstances.push(o.obj);
    },

    processVirtualDisk : function(virtualDisk, virtualMachine) {
        var virtualDiskObj = {};
        virtualDiskObj[LABEL] = '' + virtualDisk.getDeviceInfo().getLabel();
        virtualDiskObj[CAPACITY_KB] = '' + virtualDisk.getCapacityInKB();
        virtualMachine['virtualDisk'].push(virtualDiskObj);
	},

	extractNic: function(device, guest) {
		var addresses, address, noPrefix, ipConfig,
			net = guest && guest.net,
			ipStack = guest && ipStack,
			nic = {
				mac_address: '' + device.getMacAddress()
			};

		// 1. Find the net device with the mac address
		net = net && net.find(
			function(net) {
				return '' + net.macAddress == nic.mac_address;
			});

		// 2. If we found it, try to get dns server, ip address, subnet mask & dhcp from it
		if (net) {
			ipConfig = net.ipConfig;

			// Just pick the first DNS server...
			nic.dns_server = net.dnsConfig && net.dnsConfig.ipAddress[0];
			addresses = ipConfig && ipConfig.ipAddress;

			// Look for an IP V4 address first, then use IP V6
			if (addresses) {
				if (!addresses.find(isIpV4))
					addresses.find(isIpV6);
			}
		}

		// 3. Look for the gateway, preferring the default gateway
		if (nic.ip_address && ipStack) {
			if (!ipStack.some(useIpStack)) {
				noPrefix = true;
				ipStack.some(useIpStack);
			}
		}

		if (!nic.dns_server)
			delete nic.dns_server;
		if (nic.dhcp_enabled === undefined)
			delete nic.dhcp_enabled;

		return nic;

		function useIpStack(stack) {
			if (stack.ipRouteConfig && stack.ipRouteConfig.ipRoute)
				return stack.ipRouteConfig.ipRoute.some(
					function(route, idx) {
						if ((idx == foundIdx) && (noPrefix || !route.prefixLength) && route.gateway && route.gateway.ipAddress) {
							nic.ip_default_gateway = route.gateway.ipAddress;
							return true;
						}
					});
		}

		function isIpV4(address, idx) {
			if (address.ipAddress && address.ipAddress.match(v4)) {
				foundIdx = idx;
				nic.ip_address = address.ipAddress;
				nic.subnet_mask = masks[address.prefixLength];
				nic.dhcp_enabled = ipConfig.dhcp && ipConfig.dhcp.ipv4 && ipConfig.dhcp.ipv4.enable;
				return true;
			}
		}

		function isIpV6(address, idx) {
			foundIdx = idx;
			nic.ip_address = address.ipAddress;
			nic.dhcp_enabled = ipConfig.dhcp && ipConfig.dhcp.ipv6 && ipConfig.dhcp.ipv6.enable;
		}
	},

	processNetwork: function(network, thisObj) {
        var props = ['name',
                     'summary.accessible',
                     'vm',
                     'host'];

        var o = thisObj.processObjectProperties(props, network);

        if (!thisObj.processedNetworks[o.obj.morid]) {
            thisObj.processedNetworks[o.obj.morid] = true;
            thisObj.networks.push(o.obj);
        }

        thisObj.processRelationship('host', o, thisObj.networkHostRel, thisObj);
    },

    processRelationship: function(prop, o, relArray, thisObj) {
        relArray[o.obj.morid] = [];


        var objects = o.propvals.get(prop) || [];
        for (var i = 0; i < objects.length; i++) {
            var object = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), objects[i]);
            relArray[o.obj.morid].push(object.getMOR().val);
        }
    },

    processRelationshipSubFolder: function(prop, o, relArray, thisObj) {
        relArray[o.obj.morid] = [];

        var folder = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), o.propvals.get(prop));
        var props = ['childEntity'];

        var folderObj = thisObj.processObjectProperties(props, folder);
		o.obj[prop] = folderObj.obj.morid;
        var subfolders = folderObj.propvals.get('childEntity') || [];

        for (var i = 0; i < subfolders.length; i++) {
            var subfolder = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), subfolders[i]);			
			// ignore folders
			if (subfolder && subfolder.getMOR().type.matches("Folder"))
				continue;
			
			relArray[o.obj.morid].push(subfolder.getMOR().val);
        }
    },


    processSingleRelationship: function(prop, o, relArray, thisObj) {
        relArray[o.obj.morid] = [];
        var object = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), o.propvals.get(prop));
        relArray[o.obj.morid].push(object.getMOR().val);
    },

    processResourcePool: function(resourcePool, thisObj) {
        var props = ['name',
                     'owner',
                     'parent',
                     'config.cpuAllocation.limit', 
                     'config.cpuAllocation.reservation', 
                     'config.cpuAllocation.shares.shares', 
                     'config.cpuAllocation.expandableReservation', 
                     'config.memoryAllocation.limit', 
                     'config.memoryAllocation.reservation',
                     'config.memoryAllocation.shares.shares',
                     'config.memoryAllocation.expandableReservation'];

        var o = thisObj.processObjectProperties(props, resourcePool);

        var owner = o.propvals.get('owner');
        var resource = new vim25.mo.ComputeResource(thisObj.serviceInstance.getServerConnection(), owner);
        o.obj['owner'] = resource.getName();
        var owner_morid = '' + resource.getMOR().val;
        o.obj['owner_morid'] = owner_morid;

        var parent = o.propvals.get('parent');
        var managedEntity = new vim25.mo.ManagedEntity(thisObj.serviceInstance.getServerConnection(), parent);
        o.obj['parent'] = managedEntity.getMOR().val;

        // Build relationships - weird indirection because the resource pools that are not part of a cluster
        // aren't owned directly by the host, but the parent of the host
        if (thisObj.processedClusters[owner_morid]) {
            thisObj.resourcePoolClusterRel[o.obj.morid] = [];
            thisObj.resourcePoolClusterRel[o.obj.morid].push(owner_morid);
        } else {
            for (var item in thisObj.hostParent)
                if (owner_morid == thisObj.hostParent[item]) {
                    thisObj.resourcePoolHostRel[o.obj.morid] = [];
                    thisObj.resourcePoolHostRel[o.obj.morid].push(item);
                }
        }

        thisObj.resourcePools.push(o.obj);
    },

    processManagedEntities: function(type, processFunc, thisObj) {
        this.debug('Now processing: ' + type);
        var rootFolder = this.serviceInstance.getRootFolder();
        var managedEntities = vim25.mo.InventoryNavigator(rootFolder).searchManagedEntities(type);

        for (var i = 0; i < managedEntities.length; i++)
            processFunc(managedEntities[i], thisObj);
    },

    processObjectProperties: function(props, vCenterObject) {
        var propvals = vCenterObject.getPropertiesByPaths(props);
        var o = {};
        var e = propvals.keys();

        while(e.hasMoreElements()) {
            var key = e.nextElement();
            var prop = propvals.get(key);

            if (prop instanceof Packages.java.lang.Integer ||
                prop instanceof Packages.java.lang.Short ||
                 prop instanceof Packages.java.lang.String ||
                prop instanceof Packages.java.lang.Long ||
                prop instanceof Packages.java.lang.Boolean)
                  o[key] = '' + prop;
        }

        o['morid'] = '' + vCenterObject.getMOR().val;
        return {'obj':o, 'propvals':propvals};
    },

    /**
     * Writes the XML payload representing the VMWare environment managed by vCenter
     */
    generateXMLPayload : function() {
        this.createOutputRecord = false;
        this.newResult();

        this.vCenterXmlPayload();
    },

    vCenterXmlPayload : function() {
        this.objectXmlPayload('vCenter', this.vCenter, false);
        this.objectListXmlPayload('datacenter', this.datacenters);
        this.objectListXmlPayload('folder', this.folders);
        this.objectListXmlPayload('cluster', this.clusters);
        this.objectListXmlPayload('hostSystem', this.hosts);
        this.objectListXmlPayload('dataStore', this.datastores);
        this.objectListXmlPayload('virtualMachine', this.vmInstances);
        this.objectListXmlPayload('resourcePool', this.resourcePools);
        this.objectListXmlPayload('network', this.networks);

        this.relXmlPayload('hostVmRels', 'host', 'vm', this.hostVmRel);
        this.relXmlPayload('networkVmRels', 'vm', 'network', this.networkVmRel);
        this.relXmlPayload('networkHostRels', 'network', 'host', this.networkHostRel);
        this.relXmlPayload('datastoreVmRels', 'datastore', 'vm', this.datastoreVmRel);
        this.relXmlPayload('datastoreHostRels', 'host', 'datastore', this.datastoreHostRel);
        this.relXmlPayload('clusterHostRels', 'host', 'cluster', this.hostClusterRel);
        this.relXmlPayload('resourcePoolClusterRels', 'resourcePool', 'cluster', this.resourcePoolClusterRel);
        this.relXmlPayload('resourcePoolHostRels', 'resourcePool', 'host', this.resourcePoolHostRel);
        this.relXmlPayload('folderRels', 'folder', 'folderitem', this.folderRel);
        this.relXmlPayload('datacenterNetworkRels', 'datacenter', 'network', this.datacenterNetworkRel);
        this.relXmlPayload('datacenterVmRels', 'datacenter', 'vm', this.datacenterVmRel);
        this.relXmlPayload('datacenterHostRels', 'datacenter', 'host', this.datacenterHostRel);        
        this.relXmlPayload('datacenterDatastoreRels', 'datacenter', 'datastore', this.datacenterDatastoreRel);

        this.pop();
    },

    relXmlPayload: function(relName, type1, type2, rels) {
        var topElement = this.createElement(relName, '');
        this.setCurrent(topElement);

        for (var element in rels) {
            var relElement = this.createElement(type1, '');
            this.setCurrent(relElement);
            this.setAttribute(type1 + 'MORid', element);

            var subElement = this.createElement(type2 + 's', '');
            this.setCurrent(subElement);

            var subItems = rels[element];
            for (var i = 0; i < subItems .length; i++) {
                var subElement2 = this.createElement(type2, '');
                this.setCurrent(subElement2);           
                this.setAttribute(type2 + 'MORid', subItems[i]);
                this.pop();
            }

            this.pop();
            this.pop();
        }

        this.pop();
    },

    objectListXmlPayload: function(elementName, objects) {
        var elements = this.createElement(elementName + 's', '');
        this.setCurrent(elements);
 
        // Handle each object
        for (var i = 0; i < objects.length; i++)
            this.objectXmlPayload(elementName, objects[i], true);

        this.pop();
    },

    objectXmlPayload: function(elementName, object, shouldPop) {
        var element = this.createElement(elementName, '');
        this.setCurrent(element);

        for (var name in object) {
            if (object[name] instanceof Array)
                this.objectListXmlPayload(name, object[name]);
            else 
                this.setAttribute(name, object[name]);
        }

        if (shouldPop)
            this.pop();
    },

    type : 'VMWarevCenterProbe',
});

function getVCenterObject(vRoot, jsRoot, templ) {
	
	var name, vObj, o, t, i;

	for (name in templ) {
		t = templ[name];
		if (name == 'PortWorldWideName' || name == 'NodeWorldWideName')
			vObj = getWWNString(vRoot, capitalize(name)) || undefined;
		else
			vObj = vRoot['get' + capitalize(name)]();

		if (t instanceof Array) {

			if (vObj) {
				jsRoot[name] = [ ];
				for (i = 0; i < vObj.length; i++) {
					if (typeof t[0] == 'object') {
						o = { };
						jsRoot[name].push(o);
						getVCenterObject(vObj[i], o, t[0]);
					}
					else
						jsRoot.push(vObj[i]);
				}
			}
		}
		else if (typeof t == 'object') {

			o = { };
			jsRoot[name] = o;
			vObj && getVCenterObject(vObj, o, t);
		}
		else if (typeof t == 'function')
			t(vRoot, jsRoot);
		else
			jsRoot[name] = vObj;
	}

	function capitalize(s) { return s[0].toUpperCase() + s.substr(1); }
}

})();
