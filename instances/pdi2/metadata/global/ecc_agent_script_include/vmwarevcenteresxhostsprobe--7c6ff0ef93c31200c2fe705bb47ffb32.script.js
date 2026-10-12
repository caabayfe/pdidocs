/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;
 
var VMWarevCenterESXHostsProbe = Class.create();

(function() {

var _this,
	output = { },
	IPHost = Packages.com.snc.commons.networks.IPHost,
	dsMap = { 'summary.capacity': 'capacity' },
	dsSizes = { },
	dvpgDatamap = {
		config: {
			distributedVirtualSwitch: { }
		}
	};

//////////////////////////////////////////////////////////////////////////
VMWarevCenterESXHostsProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
		var name,
			leftOverMors = JSON.parse('' + probe.getParameter('mor_ids')),
			debug = ('' + probe.getParameter('debug')) == 'true',
			// Average measured size of a host is 1400 bytes, but the page
			// size for the storage probe varies widely.  That page size is
			// set to 5 for safety.  I'm defaulting this to 10 just to keep
			// the number of host probes similar to the number of storage
			// probes.
			pageSize = parseInt(probe.getParameter('page_size')) || 10,
			hostMorIds = leftOverMors.splice(0, pageSize),
			originalData = [ ],
			results = { cmdb_ci_esx_server: [ ] },
			hostMap = {
				name: 'name',
				summary: {
					hardware: {
						uuid: 'correlation_id',
						cpuMhz: 'cpu_speed',
						model: 'model_id',
						memorySize: 'ram',
						numCpuPkgs: 'cpu_count',
						numCpuCores: 'cpu_core_count',
						vendor: 'manufacturer', 
						cpuModel: 'cpu_type',
						
					},
					managementServerIp : 'vcenter_ip'
				},
				hardware: {
					cpuPkg: [ { vendor: 'cpu_manufacturer' } ],
					SystemInfo: {
						OtherIdentifyingInfo: [ {
							IdentifierType: {
								Key: 'key'
							},
							IdentifierValue: 'value'
						}]
					},
					cpuInfo: {
						numCpuThreads: 'logical_processor'
					}
				},
				'config.product.fullName': 'os_version',
				'config.hyperThread.active': 'hyper_threading',
				runtime: {
					bootTime: 'start_date',
					powerState: 'power_state',
					connectionState: 'connection_state',
					inMaintenanceMode: 'maintenance'
				},
				network: [ { } ],
				datastore: [ { } ],
				vm: [ { } ],
				parent: { },
			};

		if (!this.serviceInstance)
			return;

		_this = this;

		/*
		Sample data.  Truncated for brevity, so possibly inconsistent:
			[
			  {
				"type": "HostSystem",
				"morid": "host-1025",
				"name": "DC0_C14_H4",
				"summary": {
				  "hardware": {
					"correlation_id": "33393138-3335-5553-4537-32324e35394b",
					"cpu_speed": 2999,
					"model_id": "ProLiant DL380 G5",
					"ram": 17175269376,
					"cpu_count": 2,
					"cpu_core_count": 4,
					"manufacturer": "HP",
					"cpu_type": "Intel(R) Xeon(R) CPU            5160  @ 3.00GHz"
				  }
				},
				"hardware": {
				  "cpuPkg": [
					{
					  "cpu_manufacturer": "intel"
					},
					{
					  "cpu_manufacturer": "intel"
					}
				  ],
				  "SystemInfo": {
					"OtherIdentifyingInfo": [
					  {
						"IdentifierType": {
						  "key": "AssetTag"
						},
						"value": " unknown"
					  }
					]
				  }
				},
				"install_status": false,
				"os_version": "VMware ESX 5.0.0 build-5.0.0.19",
				"network": [
				  {
					"type": "Network",
					"morid": "network-7"
				  },
				  {
					"type": "DistributedVirtualPortgroup",
					"morid": "dvportgroup-9"
				  }
				],
				"datastore": [
				  {
					"type": "Datastore",
					"morid": "datastore-63"
				  },
				  {
					"type": "Datastore",
					"morid": "datastore-1177"
				  }
				],
				"vm": [
				  {
					"type": "VirtualMachine",
					"morid": "vm-5812"
				  },
				  {
					"type": "VirtualMachine",
					"morid": "vm-4443"
				  }
				],
				"parent": {
				  "type": "ClusterComputeResource",
				  "morid": "domain-c105"
				}
			  }
			]
		*/
		// Iterate over the MOR IDs of hosts we're going to explore
		hostMorIds.forEach(
			function(host) {
				var table,
					mor = new vim25.ManagedObjectReference();

				try {
					// Create a managed object for the current host, fetch data for it from vCenter.
					// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.HostSystem.html
					mor.setType('HostSystem');
					mor.setVal(host.morid || host);
					host = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
					host = _this.getPropsForManagedObject(host, hostMap);

					// If we're debugging, save the data we fetched
					if (debug)
						originalData.push(JSON.stringify(host));

					fixHost(host);
					results.cmdb_ci_esx_server.push(host);
				} catch (e) {
					this.probe.appendWarning('Caught exception when processing HostSytem ' + host + ': ' + e.toString());
				}
			});

		if (debug)
			results.originalData = originalData.map(JSON.parse);
		
		// We fetched at most pageSize hosts.  Send back the IDs of remaining hosts so the
		// sensor can fire another probe.
		if (leftOverMors.length)
			results.leftOverMors = leftOverMors;

		this.output = JSON.stringify(results, function(key, value) { if (key != "mo") return value; });
	},

	type : 'VMWarevCenterESXHostsProbe'
});

//////////////////////////////////////////////////////////////////////////
function fixHost(host) {
	var name, mor, dvpg,
		ips = new IPHost(host.name).resolveAddress(),
		hardware = host.hardware,
		si = hardware && hardware.SystemInfo,
		oi = si && si.OtherIdentifyingInfo,
		runtime = host.runtime;
	
	for (name in host.summary.hardware)
		host[name] = host.summary.hardware[name];
	host.vcenter_ip =  host.summary.vcenter_ip;
	delete host.summary;

	if (ips.length > 0)
		host.ip_address = '' + ips[0].toString();
	
	host.cpu_core_count /= host.cpu_count;

	host.cpu_manufacturer = host.hardware.cpuPkg[0].cpu_manufacturer;

	if (oi) {
		oi.forEach(function(id) {
			var fieldname,
				val = id.value,
				key = id.IdentifierType;

			if (val && (key.key == 'ServiceTag'))
				host.serial_number = val;
		});
	}
	
	host.logical_processor = hardware.cpuInfo.logical_processor;
	
	delete host.hardware;
	
	host.start_date = runtime.start_date;
	host.power_state = runtime.power_state;
	host.connection_state = runtime.connection_state;
	host.install_status = runtime.maintenance ? '3' : '1';// Maintenance = 3, Installed = 1
	
	delete host.runtime;

	host.ram = (host.ram/(1024*1024)) | 0;

	host.cluster = [ host.parent.morid ];
	delete host.parent;

	host.network.forEach(
		function(network) {
			if (network.type == 'DistributedVirtualPortgroup') {
				mor = new vim25.ManagedObjectReference();
				mor.setType(network.type);
				mor.setVal(network.morid);
				dvpg = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
				dvpg = _this.getPropsForManagedObject(dvpg, dvpgDatamap);
				if (dvpg.config && dvpg.config.distributedVirtualSwitch)
					host.cmdb_ci_vcenter_dvs = dvpg.config.distributedVirtualSwitch.morid;
			}
		});

	extractMORs(host.datastore);
	extractMORs(host.network);
	extractMORs(host.vm);
	
	host.disk_space = 0;
	host.datastore.forEach(
		function(ds) {
			host.disk_space += (getDatastoreCapacity(ds) / (1024*1024*1024));
		});

	// Bitwise OR with 0 is an easy way to ensure the value is an int, but it only works
	// on 32 bit integers.  We're OK because disk_space is in GB, but this won't work
	// if we change it to bytes.
	host.disk_space = host.disk_space | 0;

	if(host.start_date != null) {
		// Get the ESX server's boot time in its local time
		var esxLocalTime = host.start_date.toZonedDateTime();

		// Convert the ESX server's local time to UTC time
		var esxUtcTime = esxLocalTime.withZoneSameInstant(Packages.java.time.ZoneId.of("UTC"));
		
		// Format the UTC time to a string representation of GlideDateTime
		var format = Packages.java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		host.start_date = esxUtcTime.format(format);
	}

	function extractMORs(a) {
		a.forEach(function(o, idx) { a[idx] = o.morid; });
	}
}

//////////////////////////////////////////////////////////////////////////
function getDatastoreCapacity(dsMorId) {
	var mor, ds;
	
	if (!dsSizes.hasOwnProperty(dsMorId)) {
		mor = new vim25.ManagedObjectReference();
		mor.setType('Datastore');
		mor.setVal(dsMorId);
		ds = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
		ds = _this.getPropsForManagedObject(ds, dsMap);
		
		dsSizes[dsMorId] = ds.capacity || 0;
	}
	
	return dsSizes[dsMorId];
}

})();
