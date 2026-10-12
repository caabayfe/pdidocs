/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;
var VMWarevCenterDatastoresProbe = Class.create();

(function() {

var _this, debug,
	originalData = [ ],
	gigabyte = 1024*1024*1024,
	hostmounts = [ ],
	datastores = [ ],
	disks = [ ],
	datastoreMapByMorId = { },
	pods = [ ],
	output = {
		cmdb_ci_vcenter_datastore: datastores,
		vcenter_datastore_hostmount: hostmounts,
		cmdb_ci_vcenter_datastore_disk: disks
	},
	hostDiskDataMap = {
		config: {
			storageDevice: {
				scsiLun: [{
					CanonicalName: 'name',
					uuid: 'uuid',
					capacity: {
						Block: 'blocks',
						BlockSize: 'blockSize'
					}
				}]
			}
		}
	};

//////////////////////////////////////////////////////////////////////////
VMWarevCenterDatastoresProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
		var name,
			leftOverMors = JSON.parse('' + probe.getParameter('mor_ids')),
			// Average measured size of a datastore (with mounts and disks) is
			// 1000 bytes.  Default page size of 500 leaves us well below the
			// 5 MB limit.
			pageSize = parseInt(probe.getParameter('page_size')) || 500,
			datastoreMorIds = leftOverMors.splice(0, pageSize),
			storagepodMap = {
				childEntity: [ { name: 'name' } ],
				summary: {
					capacity: 'capacity',
					freeSpace: 'freespace',
					name: 'name'
				}
			},
			datastoreMap = {
				summary: {
					accessible: function(value, o) { o.accessible = !!value.isAccessible(); },
					capacity: 'capacity',
					freeSpace: 'freespace',
					name: 'name',
					type: 'type',
					url: 'url'
				},
				'capability.perFileThinProvisioningSupported': 'thin',
				vm: [ { } ],
				host: [ {
						mountInfo: {
							accessible: 'accessible',
							accessMode: 'accessMode'
						},
						key: { }
					} ],
				info: {
					vmfs: {
						uuid: 'uuid',
						local: 'local',
						extent: [ {
							diskName: 'diskname',
							partition: 'partition'
						} ]
					}
				}
			},
			datamap = {
				StoragePod: storagepodMap,
				Datastore: datastoreMap
			};

		debug = ('' + probe.getParameter('debug')) == 'true';

		if (!this.serviceInstance)
			return;

		_this = this;

		/*
		Sample data.  Truncated for brevity, so possibly inconsistent:
			[
			  {
				"type": "Datastore",
				"morid": "datastore-170",
				"summary": {
				  "accessible": false,
				  "capacity": 1099511627776,
				  "freespace": 824633720832,
				  "name": "SANLAB1DS_DC0_C0_0",
				  "type": "VMFS",
				  "url": "ds:\/\/\/vmfs\/volumes\/527018c7-5acd-a0b9-ec8e-56c691d9c139\/"
				},
				"thin": true,
				"vm": [

				],
				"host": [
				  {
					"mountInfo": {
					  "accessible": true,
					  "accessMode": "readWrite"
					},
					"key": {
					  "type": "HostSystem",
					  "morid": "host-1405",
					  "config": {
						"storageDevice": {
						  "scsiLun": [
							{
							  "name": "mpx.vmhba0:C0:T0:L0",
							  "uuid": "0005000000766d686261303a303a30"
							},
							{
							  "name": "mpx.vmhba1:C0:T0:L0",
							  "uuid": "0000000000766d686261313a303a30",
							  "capacity": {
								"blocks": 1146734896,
								"blockSize": 512
							  }
							}
						  ]
						}
					  }
					}
				  },
				  {
					"mountInfo": {
					  "accessible": true,
					  "accessMode": "readWrite"
					},
					"key": {
					  "type": "HostSystem",
					  "morid": "host-799",
					  "config": {
						"storageDevice": {
						  "scsiLun": [
							{
							  "name": "mpx.vmhba0:C0:T0:L0",
							  "uuid": "0005000000766d686261303a303a30"
							},
							{
							  "name": "mpx.vmhba1:C0:T0:L0",
							  "uuid": "0000000000766d686261313a303a30",
							  "capacity": {
								"blocks": 1146734896,
								"blockSize": 512
							  }
							}
						  ]
						}
					  }
					}
				  }
				],
				"info": {
				  "vmfs": {
					"uuid": "527018c7-5acd-a0b9-ec8e-56c691d9c139",
					"extent": [
					  {
						"diskname": "mpx.vmhba1:C0:T0:L0",
						"partition": 3
					  }
					]
				  }
				}
			  }
			]
		*/
		// Iterate over the MOR IDs of datastores we're going to explore
		datastoreMorIds.forEach(
			function(ds) {
				try {
					var mor = new vim25.ManagedObjectReference();

					// Create a managed object for the current datastore, fetch data for it and its
					// host mounts and disks from vCenter.
					// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.Datastore.html
					mor.setType(ds.type);
					mor.setVal(ds.morid);
					ds = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
					ds = _this.getPropsForUnknownType(ds, datamap);

					// If we're debugging, save the data we fetched
					if (debug)
						originalData.push(JSON.stringify(ds));

					fixDatastore(ds);
					datastores.push(ds);
				} catch (e) {
					this.probe.appendWarning('Caught exception when processing ' + ds.type + ' ' + ds.morid + ': ' + e.toString());
				}
			});

		pods.forEach(function(pod) {
			pod.stores = pod.childEntity.map(function(ds) { return datastoreMapByMorId[ds.morid]; });
			pod.childEntity = undefined;
		});

		// We fetched at most pageSize datastores.  Send back the IDs of remaining datastores so the
		// sensor can fire another probe.
		if (leftOverMors.length)
			output.leftOverMors = leftOverMors;

		if (debug)
			output.originalData = originalData.map(JSON.parse);
		
		// Stringify the results, dropping anything named 'mo' (these are vijava ManagedObjects)
		this.output = JsonCi.decircularize(output, function(key, value) { if (key != "mo") return value; });
	},

	type : 'VMWarevCenterDatacentersProbe'
});

//////////////////////////////////////////////////////////////////////////
function fixDatastore(ds) {
	var name,
		extent = ds.info.vmfs.extent,
		hostdisks = { },
		hostKeys = [ ];

	delete ds.info;

	for (name in ds.summary)
		ds[name] = ds.summary[name];
	delete ds.summary;

	ds.capacity = (ds.capacity / gigabyte) | 0;
	ds.freespace = (ds.freespace / gigabyte) | 0;

	if (ds.type == 'StoragePod') {
		ds.clustered = true;
		delete ds.type;
		pods.push(ds);
		return;
	}

	datastoreMapByMorId[ds.morid] = ds;
	ds.host.forEach(
		function(hostMount) {
			hostKeys.push(hostMount.key);
			hostMount.host = hostMount.key.morid;
			hostMount.accessible = hostMount.mountInfo.accessible;
			hostMount.access_mode = hostMount.mountInfo.accessMode;
			hostMount.datastore = ds;
			hostmounts.push(hostMount);
			delete hostMount.key;
			delete hostMount.mountInfo;
		});

	extent && extent.forEach(function(disk, idx) {
		var dsd, lun;

		while (!hostdisks.hasOwnProperty(disk.diskname) && hostKeys.length)
			getDisksForHost(hostKeys.pop());

		lun = hostdisks[disk.diskname];

		if (lun) {
			dsd = {
				datastore: ds,
				name: disk.diskname,
				correlation_id: lun.uuid,
			};
			if (lun.capacity)
				dsd.size_bytes = lun.capacity.blockSize * lun.capacity.blocks;

			disks.push(dsd);
		} else
			_this.probe.appendWarning('Couldn\'t find disk for datastore ' + ds.name + ' extent '+ disk.diskname);
	});

	ds.vm.forEach(
		function(vm, idx) {
			ds.vm[idx] = vm.morid;
		});

	function getDisksForHost(key) {
		var host, hostConfig,
			mor = new vim25.ManagedObjectReference();

		mor.setType(key.type);
		mor.setVal(key.morid);
		host = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
		hostConfig = _this.getPropsForManagedObject(host, hostDiskDataMap);

		if (debug)
			originalData.push(JSON.stringify(hostConfig));

		hostConfig.config.storageDevice.scsiLun.forEach(
			function(lun) {
				hostdisks[lun.name] = lun;
			});
	}
}

})();
