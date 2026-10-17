/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;
 
var VMWarevCenterESXHostsStorageProbe = Class.create();

(function() {

var _this,
	trimRegex = /^\s+|\s+$/g,
	nics = [ ],
	hbas = [ ],
	fcPorts = [ ],
	disks = [ ],
	fcDisks = [ ],
	iscsiDisks = [ ];

//////////////////////////////////////////////////////////////////////////
VMWarevCenterESXHostsStorageProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
		var name,
			leftOverMors = JSON.parse('' + probe.getParameter('mor_ids')),
			debug = ('' + probe.getParameter('debug')) == 'true',
			// The payload size can vary widely for this probe.  I had
			// originally set this to 175 as a conservative estimate based
			// on internal testing, but I have since seen environments where
			// a page size of 5 results in payloads of 2.5 MB.
			pageSize = parseInt(probe.getParameter('page_size')) || 5,
			hostMorIds = leftOverMors.splice(0, pageSize),
			originalData = [ ],
			results = {
				cmdb_ci_network_adapter: nics,
				cmdb_ci_storage_hba: hbas,
				cmdb_ci_fc_port: fcPorts,
				cmdb_ci_disk: disks,
				cmdb_ci_fc_disk: fcDisks,
				cmdb_ci_iscsi_disk: iscsiDisks
			},
			vnicMap = [ {
				Device: 'device',
				Spec: {
					ExternalId: 'id',
					Mac: 'mac',
					Ip: {
						Dhcp: 'dhcp',
						IpAddress: 'ip',
						SubnetMask: 'subnetMask'
					}
				}
			} ],
			nicMap = {
				Pnic: [ {
					Device: 'device',
					Mac: 'mac',
					Spec: {
						Ip: {
							Dhcp: 'dhcp',
							IpAddress: 'ip',
							SubnetMask: 'subnetMask'
						}
					}
				} ],
				ConsoleVnic: vnicMap,
				Vnic: vnicMap
			},
			hostMap = {
				datastore: [ { } ],
				config: {
					network: nicMap,
					storageDevice: {
						ScsiLun: [{			 // The list of SCSI logical units available on the host. 
							CanonicalName: 'name',  // Canonical name of the SCSI logical unit.
							// Disk partition or extent identifiers refer to this name when referring to a disk.
							// Use this property to correlate a partition or extent to a specific SCSI disk.
							Capacity: {
								Block: 'blocks',
								BlockSize: 'blockSize'
							},
							key: 'key',
							Uuid: 'uuid',			// Universally unique identifier for the LUN used to identify ScsiLun across multiple servers.
							DisplayName: 'displayName',
							Model: 'model',
							Vendor: 'vendor'
						}],
						// a storage entity that represents a topological path from a host bus adapter to a SCSI logical unit.
						// Each path is unique although each host bus adapter/SCSI logical unit pair can have multiple paths.
						MultipathInfo: {		// The multipath configuration that controls multipath policy for ScsiLuns.
							// This data object exists only if path information is available and is configurable. 
							Lun: [ {			// List of logical units that can be configured for multipathing. 
								Id: 'key',			// Identifier of LogicalUnit.  Use this id to configure LogicalUnit multipathing policy
								Lun: 'lun',			// SCSI device corresponding to logical unit.
								Path: [ {			// Array of paths available to access this LogicalUnit. 
									Adapter: 'adapter',	// The host bus adapter at one endpoint of this path. 
									Lun: 'lun',
									Transport: {		// Transport information for the target end of the path. 
										NodeWorldWideName: 'wwnn',	// FC: The world wide node name of the target. 
										PortWorldWideName: 'wwpn',	// FC: The world wide port name of the target. 
										IScsiName: 'iqn'			// iSCSI: The iSCSI name of the target. 
									}
								} ]
							} ]
						},
						HostBusAdapter: [{		 // The list of host bus adapters available on the host. 
							Key: 'key',			   // The linkable identifier. 
							Model: 'model',			 // The model name of the host bus adapter. 
							IScsiName: 'name',			// ISCSI: The iSCSI name of this host bus adapter.
							ConfiguredStaticTarget: [{	// ISCSI: The configured iSCSI static target entries.
								Address: 'address'			// The IP address or hostname of the storage device.
							}],
							Device: 'device',			// The device name of host bus adapter.
							NodeWorldWideName: 'wwnn',	// FC: The world wide node name for the adapter.
							PortType: 'portType',			 // FC: The type of the fiber channel port.
							PortWorldWideName: 'wwpn',	// FC: The world wide port name for the adapter.
							Speed: 'speed'				// FC: The current operating speed of the adapter in bits per second.
						}],
						scsiTopology: {				// Storage topology view of SCSI storage devices. This data object exists only if storage topology information is available.
							adapter: [ {				// The list of SCSI interfaces.
								adapter: 'adapter',			// The link to data for this SCSI interface.
								target: [ {					// The list of targets to which the SCSI interface is associated.
									transport: {				// SCSI Transport information about the target.
										NodeWorldWideName: 'wwnn',	// FC: The world wide node name of the target.
										PortWorldWideName: 'wwpn',	// FC: The world wide port name of the target.
										IScsiName: 'iqn'			// iSCSI: The iSCSI name of the target.
									},
									lun: [ {					// The list of SCSI logical units with which a target is associated.
										lun: 'lun',					// The logical unit number of the SCSI logical unit
										scsiLun: 'key'				// The link to data for this SCSI logical unit.
									}]
								}]
							}]
						}
					}
				}
			};

		if (!this.serviceInstance)
			return;

		_this = this;

		/*
		Sample data.  Truncated for brevity, so possibly inconsistent:
			[
			  {
				"type": "HostSystem",
				"morid": "host-1033",
				"datastore": [
				  {
					"type": "Datastore",
					"morid": "datastore-1183"
				  },
				  {
					"type": "Datastore",
					"morid": "datastore-184"
				  }
				],
				"config": {
				  "network": {
					"Pnic": [
					  {
						"device": "vmnic0",
						"mac": "",
						"Spec": {
						  "Ip": {
						  }
						}
					  },
					  {
						"device": "vmnic1",
						"mac": "",
						"Spec": {
						  "Ip": {
						  }
						}
					  }
					],
					"ConsoleVnic": [
					],
					"Vnic": [
					  {
						"device": "vmk0",
						"Spec": {
						  "mac": "00:00:00:00:00:99",
						  "Ip": {
						  }
						}
					  }
					]
				  },
				  "storageDevice": {
					"ScsiLun": [
					  {
						"name": "mpx.vmhba0:C0:T0:L0",
						"uuid": "0005000000766d686261303a303a30",
						"displayName": "Local HL-DT-ST CD-ROM (mpx.vmhba0:C0:T0:L0)",
						"model": "DVD-ROM GDR-D10N",
						"vendor": "HL-DT-ST"
					  },
					  {
						"name": "mpx.vmhba1:C0:T0:L0",
						"Capacity": {
						  "blocks": 1146734896,
						  "blockSize": 512
						},
						"uuid": "0000000000766d686261313a303a30",
						"displayName": "Local VMware Disk (mpx.vmhba1:C0:T0:L0)",
						"model": "Block device    ",
						"vendor": "VMware  "
					  }
					],
					"MultipathInfo": {
					  "Lun": [
						{
						  "id": "0000000000766d686261313a303a30",
						  "lun": "key-vim.host.ScsiDisk-0000000000766d686261313a303a30",
						  "Path": [
							{
							  "adapter": "key-vim.host.BlockHba-vmhba1",
							  "lun": "key-vim.host.MultipathInfo.LogicalUnit-0000000000766d686261313a303a30",
							  "Transport": {
							  }
							}
						  ]
						},
						{
						  "id": "0005000000766d686261303a303a30",
						  "lun": "key-vim.host.ScsiLun-0005000000766d686261303a303a30",
						  "Path": [
							{
							  "adapter": "key-vim.host.BlockHba-vmhba0",
							  "lun": "key-vim.host.MultipathInfo.LogicalUnit-0005000000766d686261303a303a30",
							  "Transport": {
							  }
							}
						  ]
						}
					  ]
					},
					"HostBusAdapter": [
					  {
						"key": "key-vim.host.BlockHba-vmhba0",
						"model": "631xESB\/632xESB IDE Controller",
						"ConfiguredStaticTarget": [
						],
						"device": "vmhba0"
					  },
					  {
						"key": "key-vim.host.BlockHba-vmhba1",
						"model": "Smart Array P400",
						"ConfiguredStaticTarget": [
						],
						"device": "vmhba1"
					  },
					  {
						"key": "key-vim.host.BlockHba-vmhba32",
						"model": "631xESB\/632xESB IDE Controller",
						"ConfiguredStaticTarget": [
						],
						"device": "vmhba32"
					  }
					]
				  }
				}
			  }
			]
		*/
		// Iterate over the MOR IDs of hosts we're going to explore
		hostMorIds.forEach(
			function(hostMor) {
				var host,
					mor = new vim25.ManagedObjectReference();

				try {
					// Create a managed object for the current host, fetch data for its storage devices from vCenter.
					// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.HostSystem.html
					mor.setType('HostSystem');
					mor.setVal(hostMor.morid || hostMor);
					host = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
					host = _this.getPropsForManagedObject(host, hostMap);

					// If we're debugging, save the data we fetched
					if (debug)
						originalData.push(JSON.stringify(host));

					// Fixup the data.  
					fixHostSystem(host);
				} catch (e) {
					this.probe.appendWarning('Caught exception when processing HostSystem ' + (hostMor.morid || hostMor) + ': ' + e.toString());
				}
			});

		if (debug)
			results.originalData = originalData.map(JSON.parse);

		// We fetched at most pageSize hosts.  Send back the IDs of remaining hosts so the
		// sensor can fire another probe.
		if (leftOverMors.length)
			results.leftOverMors = leftOverMors;

		// Stringify the results, dropping anything named 'mo' (these are vijava ManagedObjects)
		this.output = JSON.stringify(results, function(key, value) { if (key != "mo") return value; });
	},

	type : 'VMWarevCenterESXHostsStorageProbe'
});

function fixHostSystem(esx) {
	var config = esx.config,
		storageDevice = config.storageDevice,
		network = config.network,
		hbaRecs = { },
		hbaMap = { },
		scsiLuns = { },
		lunMap = { };

	esx.datastore = esx.datastore.map(function(ds) { return ds.morid; });

	network.Pnic.forEach(function(nic) { createNic(esx, nic, false); });
	network.Vnic.forEach(function(nic) { createNic(esx, nic, true); });
	network.ConsoleVnic.forEach(function(nic) { createNic(esx, nic, true); });

	storageDevice.HostBusAdapter.forEach(createHba);
	// Map scsi luns so we can get capacity & canonical name
	storageDevice.ScsiLun.forEach(function(scsiLun) { scsiLuns[scsiLun.uuid] = scsiLuns[scsiLun.key] = scsiLun; });
	storageDevice.MultipathInfo && storageDevice.MultipathInfo.Lun.forEach(createMultipathLun);
	storageDevice.scsiTopology && storageDevice.scsiTopology.adapter && createPassThruLuns(storageDevice.scsiTopology.adapter);

	function createHba(hba) {
		var rec,
			key = hba.key;

		hbaMap[key] = hba;

		if (!hba.wwnn)
			return;

		if (!hbaRecs[key]) {
			rec = {
				name: hba.device,
				device_id: hba.device,
				wwnn: hba.wwnn,
				computerMorid: esx.morid,
				model_id: hba.model
			};

			hbaRecs[key] = rec;
			rec.idx = hbas.push(rec) - 1;
		}

		rec = hbaRecs[key];
		fcPorts.push({
			wwpn: hba.wwpn,
			wwnn: hba.wwnn,
			speed: hba.speed,
			controller: rec.idx
		});
	}

	function createMultipathLun(lun) {
		var paths = lun.Path;

		if (!paths || !paths[0])
			return;

		paths && paths.forEach(function(path) {
			if (!path) return;                // Just in case...

			var target,
				transport = path.Transport,
				hba = hbaMap[path.adapter],
				iqn = transport.iqn,
				wwnn = transport.wwnn,
				wwpn = transport.wwpn;

			createLun(lun, hba, wwnn, wwpn, iqn);
		});
	}

	function createPassThruLuns(adapters) {
		adapters.forEach(function(adapter) {
			var hba = hbaMap[adapter.adapter];

			adapter.target && adapter.target.forEach(function(target) {
				var transport = target.transport,
					iqn = transport && transport.iqn,
					wwnn = transport && transport.wwnn,
					wwpn = transport && transport.wwpn;

				if (!target.lun || !transport || (!wwpn && !iqn))
					return;

				target.lun.forEach(function(lun) { createLun(lun, hba, wwnn, wwpn, iqn); });
			});
		});
	}

	function createLun(lun, hba, wwnn, wwpn, iqn) {
		var rec, iScsiTarget,
			list = disks,
			scsiLun = scsiLuns[lun.key],
			capacity = scsiLun && scsiLun.Capacity;

		// The vSphere API uses one of two object types to represent a SCSI logical unit, depending on the device type.
		// * Disks containing file system volumes or parts of volumes for hosts or raw disks for virtual machines.
		// To represent disks, the ESX Server creates a HostScsiDisk object, which inherits properties from the ScsiLun base class.
		// * Other SCSI devices, for example SCSI passthrough devices for virtual machines. To represent one of these devices,
		// the ESX Server creates a ScsiLun object.
		// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.host.ScsiLun.html
		if (!capacity || !capacity.blockSize) // Capacity is on HostScsiDisk, meaning the device isn't a SCSI passthrough device.
			return;

		rec = lunMap[scsiLun.name] ||
			{
			computer: esx.morid,
			size_bytes: (capacity.blocks * capacity.blockSize) || 0,
			device_id: scsiLun.name,
			correlation_id: scsiLun.uuid,
			name: scsiLun.displayName || scsiLun.name,
			vendor: scsiLun.vendor ? scsiLun.vendor.replace(trimRegex, '') : undefined,
			model: scsiLun.model ? scsiLun.model.replace(trimRegex, '') : undefined,
			datastores: esx.datastore
		};

		// Set this here so we'll update existing records - the lun in multipathinfo is a vmware key and
		// we need to update it from scsiTopology.
		rec.device_lun = lun.lun;

		if (iqn) {
			list = iscsiDisks;
			rec.iqn = iqn;
			rec.device_lun = lun.lun; // Documented as 'SCSI device corresponding to logical unit. '
			rec.device_interface = 'iscsi';
			rec.storage_type = 'network';
			if (hba) {
				rec.initiator_iqn = hba.name;
				iScsiTarget = hba.ConfiguredStaticTarget;
				iScsiTarget = iScsiTarget && iScsiTarget[0];
				rec.target_ip = iScsiTarget && iScsiTarget.address;
			}
		} else if (wwnn) {
			list = fcDisks;
			rec.device_interface = 'fc';
			rec.storage_type = 'network';

			rec.targets = rec.targets || { };
			rec.targets[wwnn] = rec.targets[wwnn] || { };
			rec.targets[wwnn][wwpn] = 1;

			if (hba) {
				rec.initiators = rec.initiators || { };
				rec.initiators[hba.wwnn] = rec.initiators[hba.wwnn] || { };
				rec.initiators[hba.wwnn][hba.wwpn] = 1;
			}
		}

		if (!lunMap[scsiLun.name]) {
			list.push(rec);
			lunMap[scsiLun.name] = rec;
		}
	}
}

function createNic(esx, nic, virtual) {
	var spec = nic.Spec,
		ip = spec && spec.Ip;

	nics.push({
		name: nic.device,
		mac_address: nic.mac || (spec && spec.mac),  // Ugh. Data is different for virtual vs. physical
		ip_address: (ip && ip.ip) || undefined,
		netmask: (ip && ip.subnetMask) || undefined,
		cmdb_ci: esx.morid,
		virtual: virtual ? 1 : undefined,
		dhcp_enabled: ip && ip.dhcp ? 1 : undefined
	});
}

})();
