ArrayPolyfill;

var DiscoveryLinuxStorageSensor = Class.create();


//
// Class Static Constants
//
DiscoveryLinuxStorageSensor._PROC_SCSI_REGEX = /^Host: \D*(\d+) Channel: (\d+) Id: (\d+) Lun: (\d+) Vendor: (.+?) Model: (.+?) Rev: (.+?) Type: (\S+).*$/i;

DiscoveryLinuxStorageSensor._STORAGE_TYPES = {
	'Direct-Access': 'disk',
	'CD-ROM': 'cd',
	'cdrom': 'cd'
};

DiscoveryLinuxStorageSensor.prototype = Object.extendsObject(DiscoveryJSONSensor, {
	init: function() {
		DiscoverySensor.prototype.init.apply(this, arguments);
	},

	processJSON: function() {

		var name,
			results = current.results,
			tableOptions = CiSchema.prototype._DEFAULT_TABLE_OPTIONS;

		// PRB1374547: The "mvfs" filesystem mounts a single device at multiple locations, so we need to identify
		// these filesystems by both name and mount point.  I don't want to risk breaking other storage discovery
		// so I can't modify the schema in CiSchema, so I modify it here.
		// I can't just add an entry for cmdb_ci_file_system because referrals are made to cmdb_ci_storage_volume
		// and my file systems will be deleted when those referrals aren't found.
		// 1. Add an entry for cmdb_ci_file_system and remove the entry for cmdb_ci_storage_volume
		tableOptions.cmdb_ci_file_system = CiSchema.prototype._DEFAULT_TABLE_OPTIONS.cmdb_ci_storage_volume;
		delete tableOptions.cmdb_ci_storage_volume;
		// 2. Update the entry with the correct table name and update the indices
		tableOptions.cmdb_ci_file_system.table = 'cmdb_ci_file_system';
		tableOptions.cmdb_ci_file_system.indices.push('mount_point');
		// 3. Go through all other referrals.  Find referrals to cmdb_ci_storage_volume and change them
		// to cmdb_ci_file_system.
		for (name in tableOptions) {
			tableOptions[name].referrals.forEach(function(referral) {
				if (referral.table == 'cmdb_ci_storage_volume')
					referral.table = 'cmdb_ci_file_system';
			});
		}

		if (this.isDebugging())
			Debug.logObject('Linux Storage Results', results);

		results.mappedDevices = current.mappedDevices;
		results.multipathPools = current.multipathPools;
		results.sysBlocks = current.sysBlocks;
		results.df = current.df;
		results.diskSizeMap = current.diskSizeMap; // device path => size in bytes
		results.procMounts = current.procMounts;
		results.fcAdapters = current.fcAdapters;
		results.fcPorts = current.fcPorts;

		// used if /sys/block doesn't exist. host:bus:target:lun => device id (sda1, sda2, etc.)
		this._sysBusMap = ( typeof current.sysBusMap !== 'undefined' ? current.sysBusMap : null );
		// hash of sysblock by name
		this._sysBlockNameMap = this._createSysBlockNameMap(results);
		// hash procMounts by name
		this._procMountNameMap = this._createProcMountNameMap(results);

		var deviceCi = this.getDeviceCi();

		// PRB1363070 :The Linux - Storage probe doesn't discover Veritas CIs. It deletes all CIs in subclasses of
		// any table it does discover, so it winds up deleting most Veritas CIs (because the tables extend storage_pool
		// or storage_pool_member) on basis of referral schema flag of parent table.
		// Before processing Linux Storage payload, we need to change referral schema
		// (deleteMissing = false was deleteMissing = true and retireMissing = true was retireMissing = false) for
		// Linux Storage Server so that it will not delete CIs referred by Linux Storage server. It will retire Cis
		// instead of delete. We need to un-retire CIs in Veritas Volume Manager - Storage Sensor that was retired
		// incorrectly while processing this script include(During Linux Storage Discovery).

		// According to Ci and CiSchema script include, this behaviour is perfectly fine. Linux Storage Probe is not
		// handling veritas related Ci and  because of that Veritas related CI will be absent during
		// Linux Storage Discovery. Ci script include implementation will delete most of veritas CI. To avoid
		// performance overhead, I have  modified referral schema of Linux Storage Server so that it will not delete
		// veritas Ci and retire them instead.
		var tableSchema = deviceCi._referralSchemas;
		if (tableSchema != null) {
			tableSchema.forEach(function(schema) {
				if (schema.table == 'cmdb_ci_storage_pool' || schema.table == 'cmdb_ci_storage_pool_member') {
					schema.deleteMissing = false;
					schema.retireMissing = true;
				}
			});
		}

		// process the /proc/ide probe
		this._processProcIde(results, deviceCi);

		// process the /proc/scsi probe
		this._processProcScsi(results, deviceCi);

		this._processPartitions(results, deviceCi);

		// process device mapper disks found from the "dmsetup" command
		this._processDeviceMapperDevices(results, deviceCi);

		// process device mapper pools the "dmsetup table" command
		this._processLvmPools(results, deviceCi);

		// process lvm extents
		this._processLvmPoolMembers(results, deviceCi);

		// process multipath pools found from the "multipath -ll" command
		this._processMultipathPools(results, deviceCi);

		// process mpio policy groups and paths
		this._processMultipathPoolMembers(results, deviceCi);

		// process file systems
		this._processFileSystems(results, deviceCi);

		// process FC HBAs from /sys/class/scsi_host
		this._processFcAdapters(results, deviceCi);

		// process FC ports from /sys/class/fc_host
		this._processFcPorts(results, deviceCi);

		// aggregate all attached disk space for the computer deviceCi (taking mulitpath devices into account)
		var totalBytes = this._getAggregateDataSize(results, deviceCi);

		// update device capacity as an integer.
		deviceCi.data.disk_space = new StorageDataSize(totalBytes).to(StorageDataSize.Units.GB) | 0;
	},

	after: function() {
		var probe,
			vxvm = current.results.vxvm;

		if (vxvm && vxvm.length == 1) {
			probe = new Probe.get("Veritas Volume Manager - Storage");
			if (probe) {
				probe.setSource(this.getSource());
				probe.setEccPriority(this.getParameter('priority'));
				probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
				probe.addParameter("cmdb_ci", this.getCmdbCi());
				probe.create(this.getAgent(), this.getEccQueueId());
			}
		}

		DiscoverySensor.prototype.after.apply(this, arguments);
		this._reconcileExports();
	},

	_createSysBlockNameMap: function(results) {
		var map = {};

		for (var i = 0; i < results.sysBlocks.length; ++i)
			map[results.sysBlocks[i].name] = results.sysBlocks[i];

		return map;
	},

	_createProcMountNameMap: function(results) {
		var map = {};

		for (var i = 0; i < results.procMounts.length; ++i) {
			results.procMounts[i].name = results.procMounts[i].name.replace(/\/$/, '');
			map[results.procMounts[i].name] = results.procMounts[i];
		}

		return map;
	},

	/**
	 * Processes the "proc_ide" results from probing /proc/ide.
	 */
	_processProcIde: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();

		for (var i = 0; i < results.proc_ide.length; ++i) {
			var line = results.proc_ide[i];
			if (!line.startsWith('ide:'))
				continue;

			// split the line into columns and trim each
			var columns = line.substring(4).split(/,/);
			for (var j = 0; j < columns.length; ++j)
				columns[j] = columns[j].trim();

			var data = {
				deviceId: columns[0],
				makeModel: columns[1],
				size: columns[2],
				deviceType: columns[3]
			};

			// use the first word as the vendor.  If there's only one word
			// leave vendor blank and use the word as model.
			var vendorName = '',
				modelName,
				matches = data.makeModel.match(/^(.*?)\s(.*)/);

			if (matches) {
				vendorName = matches[1];
				modelName = matches[2];
			} else
				modelName = data.makeModel;
			var makeModel = MakeAndModelJS.fromNames(vendorName, modelName, 'hardware');
			var storageType = this._getStorageType(data.deviceType);

			var dataSize = new StorageDataSize(data.size || 0);

			var diskCi = ciSchema.createCi('cmdb_ci_disk', {
				name: data.deviceId,
				device_id: data.deviceId,
				storage_type: storageType,
				device_interface: 'ide',
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				computer: deviceCi,
				'interface': 'ide', // deprecated
				drive_type: storageType // deprecated
			});
			dataSize.applyToStorageDeviceSize(diskCi);

			deviceCi.addReferral(diskCi);

			if (this.isDebugging())
				Debug.logObject('Disk CI', diskCi.toShallowObj());
		}
	},

	_processProcScsi: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();
		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });

		for (var i = 1; i < results.proc_scsi.length; i+=3) {
			if (!results.proc_scsi[i].startsWith('Host:'))
				continue;

			// combine each three-line block into a single space-separated line
			var line = results.proc_scsi[i] + ' ' + results.proc_scsi[i+1] + ' ' + results.proc_scsi[i+2];
			line = line.replace(/\s+/g, ' '); // collapse whitespace into spaces

			var matches = line.match(DiscoveryLinuxStorageSensor._PROC_SCSI_REGEX);
			if (matches === null)
				continue;

			var data = {
				hostId: +matches[1],
				channel: +matches[2],
				id: +matches[3],
				lun: +matches[4],
				vendor: matches[5],
				model: matches[6],
				rev: matches[7],
				type: matches[8]
			};

			var deviceInterface = 'scsi';
			var table = ( data.type === 'Direct-Access' ? 'cmdb_ci_disk' : 'cmdb_ci_storage_device' );
			var storageType = this._getStorageType(data.type);

			var sysBlock = this._findSysBlockByHost(results, data.hostId, data.channel, data.id, data.lun);
			if (sysBlock === null) {
				if (this.isDebugging())
					this.warn('Unable to find sysBlock for procScsi device host ID: ' + (data.hostId + ':' + data.channel + ':' + data.id + ':' + data.lun));
				continue;
			}

			var deviceName = '/dev/' + sysBlock.name;
			var makeModel = MakeAndModelJS.fromNames(sysBlock.vendor, sysBlock.model, 'hardware');

			var iscsiDevice = this._findIscsiDevice(results, deviceName);
			if (iscsiDevice) {
				table = 'cmdb_ci_iscsi_disk';
				storageType = 'network';
				deviceInterface = 'iscsi';
			}

			var dataSize = new StorageDataSize((sysBlock.sectors * sysBlock.sectorSize ) || 0);
			if (dataSize.getBytes() === 0)
				dataSize = this._findDiskDataSize(results, deviceName);

			// diskCi is not valid yet
			var diskCi = ciSchema.createCi(table, {
				name: deviceName,
				device_id: deviceName,
				device_host_id: data.hostId,
				device_bus_id: data.channel,
				device_target_id: data.id,
				device_lun: data.lun,
				device_major_minor: sysBlock.deviceMajorMinor,
				storage_type: storageType,
				device_interface: deviceInterface,
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				computer: deviceCi,
				'interface': deviceInterface, // deprecated
				drive_type: storageType // deprecated,
			});

			dataSize.applyToStorageDeviceSize(diskCi);

			deviceCi.addReferral(diskCi);

			switch (table) {
			case 'cmdb_ci_iscsi_disk':
				diskCi.searchTable = 'cmdb_ci_storage_device';   // For Ci class - look for existing rec in the base table, reclassify if needed
				diskCi.data.iqn = iscsiDevice.targetIqn;
				diskCi.data.initiator_iqn = results.sys_iscsi_initiator || '';
				diskCi.data.device_lun = iscsiDevice.lun;

				// attempt to relate to upstream volume on array
				try {
					storageReconciler.createISCSIDiskCiToVolumeRel(diskCi);
				} catch (e) {
					// It is possible they have not discovered storage so not warning without debug on
					if (this.isDebugging())
						this.warn(e);
				}

				break;
			}

			if (this.isDebugging())
				Debug.logObject('Disk CI', diskCi.toShallowObj());
		}
	},

	_processDeviceMapperDevices: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();

		for (var i = 0; i < results.mappedDevices.length; ++i) {
			var mappedDevice = results.mappedDevices[i];

			if (this.isDebugging())
				Debug.logObject('LVM Device result', mappedDevice);

			var deviceName = '/dev/mapper/' + mappedDevice.alias;

			var sysBlock = this._findSysBlockByMajorMinor(results, mappedDevice.deviceMajorMinor);
			if (sysBlock === null) {
				if (this.isDebugging())
					this.warn('Unable to find sysBlock for LVM device major/minor: ' + mappedDevice.deviceMajorMinor);

				continue;
			}

			var sectorSize = +sysBlock.sectorSize;
			if (!sectorSize)
				sectorSize = 512; // assume default on older kernels that do not report sector size

			var dataSize = new StorageDataSize((sysBlock.sectors * sectorSize) || 0);

			// Update diskSizeMap if LVM device was not returned from the fdisk probe run on the Linux host
			// Note that if the disk was returned by fdisk but we don't find it then adding it to diskSizeMap
			// will result in double counting the disk in the total disk space calculation.
			if (!results.diskSizeMap[deviceName] && !results.diskSizeMap['/dev/' + sysBlock.name])
				results.diskSizeMap[deviceName] = dataSize.getBytes();

			var diskCi = ciSchema.createCi('cmdb_ci_storage_device', {
				computer: deviceCi,
				device_id: deviceName,
				storage_type: 'logical',
				device_interface: 'lvm',
				device_major_minor: mappedDevice.deviceMajorMinor,
				name: deviceName,
				'interface': 'lvm', // deprecated
				drive_type: 'logical' // deprecated,
			});
			dataSize.applyToStorageDeviceSize(diskCi);

			deviceCi.addReferral(diskCi);

			if (this.isDebugging())
				Debug.logObject('LVM Storage Device CI', diskCi.toShallowObj());
		}
	},

	_processPartitions: function(results, deviceCi) {
		if (typeof results.sysBlocks === 'undefined')
			return;

		var ciSchema = this.getCiSchema();

		for (var i = 0; i < results.sysBlocks.length; ++i) {
			var sysBlock = results.sysBlocks[i];

			for (var j = 0; j < sysBlock.partitions.length; ++j) {
				var partition = sysBlock.partitions[j];


				if (this.isDebugging())
					Debug.logObject('Partition result', partition);

				var diskCi = this._findStorageDeviceByMajorMinor(deviceCi, sysBlock.deviceMajorMinor);
				if (diskCi === null) {
					if (this.isDebugging())
						this.warn('Disk CI not found for device major/minor: ' + sysBlock.deviceMajorMinor);

					continue;
				}

				var sectorSize = +sysBlock.sectorSize || 0;
				var beginOffset = +partition.beginOffset || 0;
				var dataSize = new StorageDataSize((partition.sectors * sectorSize) || 0);

				var partitionCi = ciSchema.createCi('cmdb_ci_disk_partition', {
					name: '/dev/' + partition.name,
					start_offset: ''+( (beginOffset * sectorSize) || 0 ),
					end_offset: ''+( beginOffset + dataSize.getBytes() ),
					partition_number: partition.number,
					device_major_minor: partition.deviceMajorMinor,
					computer: deviceCi,
					disk: diskCi
				});
				dataSize.applyToDiskPartitionSize(partitionCi);

				deviceCi.addReferral(partitionCi);
				diskCi.addReferral(partitionCi);

				if (this.isDebugging())
					Debug.logObject('Partition CI', partitionCi.toShallowObj());
			}
		}
	},

	/**
	 * Performed separately from _processDeviceMapperDisks, despite using the same data, to allow all LVM storage devices to be enumerated
	 * first.
	 */
	_processLvmPools: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();

		for (var i = 0; i < results.mappedDevices.length; ++i) {
			var mappedDevice = results.mappedDevices[i];

			if (this.isDebugging())
				Debug.logObject('LVM Pool device result', mappedDevice);

			var lvmDeviceCi = this._findDiskOrPartitionByMajorMinor(deviceCi, mappedDevice.deviceMajorMinor);
			if (lvmDeviceCi === null) {
				if (this.isDebugging())
					this.warn('Unable to find LVM pool disk or partition for device major/minor: ' + mappedDevice.deviceMajorMinor);

				continue;
			}

			var deviceName = '/dev/mapper/' + mappedDevice.alias;

			// create a device mapper pool for this device
			var poolCi = ciSchema.createCi('cmdb_ci_lvm_pool', {
				hosted_by: deviceCi,
				pool_id: deviceName,
				name: deviceName
			});
			var size = new StorageDataSize(lvmDeviceCi.data.size_bytes);
			size.applyToStoragePoolSize(poolCi);

			deviceCi.addReferral(poolCi);

			// tie pool to lvm disk
			lvmDeviceCi.data.provided_by = poolCi;
			poolCi.addReferral(lvmDeviceCi);

			if (this.isDebugging())
				Debug.logObject('LVM Pool CI', poolCi.toShallowObj());
		}
	},

	_processLvmPoolMembers: function(results, deviceCi) {
		for (var i = 0; i < results.mappedDevices.length; ++i) {
			var mappedDevice = results.mappedDevices[i];

			var poolCi = this._findPool(deviceCi, '/dev/mapper/' + mappedDevice.alias);
			if (poolCi === null) {
				if (this.isDebugging())
					this.warn('Unable to find LVM Storage Pool for member processing: ' + mappedDevice.alias);

				continue;
			}

			this._createLvmPoolMembers(results, deviceCi, poolCi, mappedDevice);
		}
	},

	_createLvmPoolMembers: function(results, deviceCi, poolCi, mappedDevice) {
		var ciSchema = this.getCiSchema();

		// create a device mapper pool member for each extent of this device result
		for (var j = 0; j < mappedDevice.extents.length; ++j) {
			var extent = mappedDevice.extents[j];

			if (this.isDebugging())
				Debug.logObject('LVM Extent', extent);

			var memberStorageCi = null; // only left null if mpio, which will be created and linked later

			if (extent.type !== 'multipath') {

			    // LVM "mapped device" that is not multipath
				memberStorageCi = this._findDiskOrPartitionByMajorMinor(deviceCi, extent.deviceMajorMinor);

				if (memberStorageCi === null) {

					// The LVM device is NOT multipath and is NOT part of an enclosing device (the extent deviceMajorMinor is null)
					if (this.isDebugging())
						this.warn('Unable to find disk or partition for LVM pool extent device major/minor: ' + extent.deviceMajorMinor);

					continue;
				}
			}

			// The LVM is a mapped device that is mapped to an enclosing device (extent.deviceMajorMinor)
			var sysBlock = this._findSysBlockByMajorMinor(results, mappedDevice.deviceMajorMinor);
			if (sysBlock === null) {
				if (this.isDebugging())
					this.warn('Unable to find sysBlock for LVM extent device major/minor: ' + mappedDevice.deviceMajorMinor);

				continue;
			}

			var sectorSize = +sysBlock.sectorSize || 0;
			var name = ( ( memberStorageCi === null ? sysBlock.dmName : memberStorageCi.data.name ) || 'LVM Pool Member' );

			var poolMemberCi = ciSchema.createCi('cmdb_ci_lvm_pool_member', {
				pool: poolCi,
				extent_type: extent.type,
				storage: memberStorageCi,
				start_offset: ''+( (+extent.startSector || 0) * sectorSize ),
				end_offset: ''+( (+extent.endSector || 0) * sectorSize ),
				name: name
			});

			if (extent.type === 'linear') {
				var sourceStartOffset = extent.sourceStartSector * sectorSize;
				poolMemberCi.data.device_major_minor = extent.deviceMajorMinor;
				poolMemberCi.data.source_start_offset = '' + sourceStartOffset;
				poolMemberCi.data.source_end_offset = '' +(sourceStartOffset + ( poolMemberCi.data.end_offset - poolMemberCi.data.start_offset ));
			}

			poolCi.addReferral(poolMemberCi);

			if (memberStorageCi !== null)
				memberStorageCi.addReferral(poolMemberCi);

			if (this.isDebugging())
				Debug.logObject('LVM Pool Member CI', poolMemberCi.toShallowObj());
		}
	},

	_processMultipathPools: function(results, deviceCi) {
		if (typeof results.multipathPools === 'undefined')
			return;

		var ciSchema = this.getCiSchema();

		for (var i = 0; i < results.multipathPools.length; ++i) {
			var pool = results.multipathPools[i];

			if (this.isDebugging())
				Debug.logObject('Multipath Pool result', pool);

			var sysBlock = this._findSysBlock(pool.deviceName);
			if (sysBlock === null) {
				if (this.isDebugging())
					this.warn('Unable to find sysBlock for mpio device: ' + pool.deviceName);

				continue;
			}

			// find the disk that maps this mpio pool
			var diskCi = this._findStorageDeviceByMajorMinor(deviceCi, sysBlock.deviceMajorMinor);
			if (diskCi === null) {
				if (this.isDebugging())
					this.warn('Unable to find MPIO disk for device major/minor: ' + sysBlock.deviceMajorMinor);

				continue;
			}

			// find the lvm pool for the disk
			if (typeof diskCi.data.provided_by === 'undefined' || !(diskCi.data.provided_by instanceof Ci) || !diskCi.data.provided_by.extendsFromTable('cmdb_ci_storage_pool')) {
				if (this.isDebugging())
					this.warn('Unexpected provider for MPIO device ID: ' + diskCi.data.device_id);

				continue;
			}

			var lvmPoolCi = diskCi.data.provided_by;
			var lvmPoolMemberCi = null;

			// find the lvm pool member for this mpio pool
			for (var j = 0, poolMemberCis = lvmPoolCi.getReferrals('cmdb_ci_lvm_pool_member'); j < poolMemberCis.length; ++j) {
				var poolMemberCi = poolMemberCis[j];
				if (poolMemberCi.data.extent_type === 'multipath') {
					lvmPoolMemberCi = poolMemberCi;
					break;
				}
			}

			if (lvmPoolMemberCi === null) {
				if (this.isDebugging())
					this.warn('Unable to find LVM Pool Member for MPIO Pool: ' + pool.alias);

				continue;
			}

			var poolCi = ciSchema.createCi('cmdb_ci_mpio_pool', {
				hosted_by: deviceCi,
				pool_id: new DiscoveryWWN(pool.wwnn).toString(),
				name: 'Multipath: ' + pool.alias
			});
			var dataSize = new StorageDataSize(lvmPoolCi.data.size_bytes);
			dataSize.applyToStoragePoolSize(poolCi);

			deviceCi.addReferral(poolCi);

			lvmPoolMemberCi.data.storage = poolCi;
			poolCi.addReferral(lvmPoolMemberCi, 'cmdb_ci_storage_pool_member', 'storage');

			if (this.isDebugging())
				Debug.logObject('Multipath Pool CI', poolCi.toShallowObj());
		}
	},

	_processMultipathPoolMembers: function(results, deviceCi) {
		for (var i = 0; i < results.multipathPools.length; ++i) {
			var pool = results.multipathPools[i];
			var wwn = new DiscoveryWWN(pool.wwnn).toString();
			var poolCi = this._findPool(deviceCi, wwn);
			if (poolCi === null) {
				if (this.isDebugging())
					this.warn('Unable to find MPIO Pool: ' + wwn);

				continue;
			}

			this._createMultipathPoolGroups(results, deviceCi, poolCi, pool);
		}
	},

	_createMultipathPoolGroups: function(results, deviceCi, poolCi, poolResult) {
		var ciSchema = this.getCiSchema();

		for (var i = 0; i < poolResult.groups.length; ++i) {
			var group = poolResult.groups[i];

			var mpioGroupCi = ciSchema.createCi('cmdb_ci_mpio_pool_group', {
				hosted_by: deviceCi,
				container: poolCi,
				pool_id: poolCi.data.pool_id + '-' + group.priority,
				priority: group.priority,
				policy: group.policy,
				name: poolCi.data.name + ' Priority #' + group.priority
			});

			deviceCi.addReferral(mpioGroupCi);
			poolCi.addReferral(mpioGroupCi);
			deviceCi.addReferral(mpioGroupCi);

			if (this.isDebugging())
				Debug.logObject('Multipath Pool Group CI', mpioGroupCi.toShallowObj());

			this._createMultipathPoolPaths(results, deviceCi, poolCi, mpioGroupCi, group);
		}
	},

	_createMultipathPoolPaths: function(results, deviceCi, mpioPoolCi, mpioPoolGroupCi, groupResult) {
		var ciSchema = this.getCiSchema();

		for (var i = 0; i < groupResult.paths.length; ++i) {
			var path = groupResult.paths[i];

			var storageDeviceCi = this._findStorageDeviceByMajorMinor(deviceCi, path.deviceMajorMinor);
			if (storageDeviceCi === null) {
				if (this.isDebugging())
					this.warn('Storage device not found for MPIO path: '+ path.deviceMajorMinor);

				continue;
			}

			var poolMemberCi = ciSchema.createCi('cmdb_ci_mpio_pool_path', {
				pool: mpioPoolGroupCi,
				storage: storageDeviceCi,
				name: storageDeviceCi.data.name
			});

			mpioPoolGroupCi.addReferral(poolMemberCi);
			storageDeviceCi.addReferral(poolMemberCi, 'cmdb_ci_storage_pool_member', 'storage');

			if (this.isDebugging())
				Debug.logObject('Multipath Pool Path CI', mpioPoolGroupCi.toShallowObj());
		}
	},

	_processFileSystems: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();
		var volumeToDiskMapper = new DiscoveryVolumeToDiskMapper({ debug: this.isDebugging() });

		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });

		for (var i = 0; i < results.df.length; ++i) {
			var df = results.df[i];

			var procMount = this._findProcMount(df.name);
			var filesystem = ( procMount !== null ? procMount.filesystem : null ); //TODO: /etc/fstab may have this entry
			filesystem = filesystem || df.fs || null;

			var nasInfo = storageReconciler.getNASInfo(df.name);
			var table, mediaType;
			if (nasInfo) {
			   table = "cmdb_ci_nas_file_system";
			   mediaType = "network";
			}
			else {
			   table = "cmdb_ci_file_system";
			   mediaType = "fixed";
			}

			var dataSize = new StorageDataSize((df.size || 0), StorageDataSize.Units.KB);
			var freeDataSize = new StorageDataSize((df.freeSpace || 0), StorageDataSize.Units.KB);

			// search for partitions of the same name
			var providedByCi = this._findPartition(deviceCi, df.name);
			if (providedByCi !== null) {
				// if the disk is a networked disk, update the fs's media type to 'network'
				switch(providedByCi.data.disk.table) {
				case 'cmdb_ci_san_disk':
				case 'cmdb_ci_iscsi_disk':
				case 'cmdb_ci_fc_disk':
					mediaType = 'network';
					break;
				}
			} else {
				// search for a (device mapper) disk of the same name
				providedByCi = this._findStorageDevice(deviceCi, df.name);
				if (providedByCi !== null) {
					// if the pool is multipath, mark media type as 'network'
					switch(providedByCi.table) {
						case 'cmdb_ci_mpio_pool':
							mediaType = 'network';
							break;
					}

					// update the pool's freespace if not known
					if (typeof providedByCi.data.provided_by !== 'undefined' && providedByCi.data.provided_by instanceof Ci) {
						var diskProvidedByCi = providedByCi.data.provided_by;
						if (diskProvidedByCi.extendsFromTable('cmdb_ci_storage_pool') && freeDataSize !== null)
							freeDataSize.applyToStoragePoolFreeSpace(diskProvidedByCi);
					}
				}
			}

			var fileSystemCi = ciSchema.createCi(table, {
				name: df.name,
				mount_point: ( df.mountPoint || null ),
				file_system: filesystem,
				media_type: mediaType,
				computer: deviceCi,
				nas_path: nasInfo ? nasInfo.path : null,
				nas_hostname : nasInfo ? nasInfo.hostname : null,
				nas_ip_address : nasInfo && nasInfo.ip ? nasInfo.ip : null,
				nas_protocol : filesystem
			});

			if (dataSize !== null)
				dataSize.applyToStorageVolumeSize(fileSystemCi);

			if (freeDataSize !== null)
				freeDataSize.applyToStorageVolumeFreeSpace(fileSystemCi);

			deviceCi.addReferral(fileSystemCi);

			if (providedByCi !== null) {
				fileSystemCi.data.provided_by = providedByCi;
				providedByCi.addReferral(fileSystemCi);
				volumeToDiskMapper.relateStorageDevice(fileSystemCi);
			}

			if (this.isDebugging())
				Debug.logObject('File System CI', fileSystemCi.toShallowObj());
		}
	},

	// Map HBAs by serial number to prevent dupes and to associate ports with HBAs
	_hbaMap: { },

	_processFcAdapters: function(results, deviceCi) {
		var manufacturer, regex, matches, makeModel,
			ciSchema = this.getCiSchema();

		for (var i = 0; i < results.fcAdapters.length; ++i) {
			var hba = results.fcAdapters[i];

			if (this._hbaMap[''+hba.serialNumber])
				continue;

			if (this.isDebugging())
				Debug.logObject('HBA result', hba);

			// parse the symbolicName for make/model. e.g., Emulex LPe12002-E FV1.00A12 DV10.2.370.12
			if (!hba.manufacturer) {
				regex = '^(.*?) ' + this._escapeRegex(hba.model);
				matches = hba.modelDescription.match(regex);
				manufacturer = matches ? matches[1] : '';
			} else
				manufacturer = hba.manufacturer;

			makeModel = MakeAndModelJS.fromNames(manufacturer, hba.model, 'hardware');

			var adapterCi = ciSchema.createCi('cmdb_ci_storage_hba', {
				computer: deviceCi,
				device_id: hba.serialNumber,
				serial_number: hba.serialNumber,
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				name: manufacturer + ' ' + hba.model + ' ' + hba.serialNumber
			});

			if (hba.wwnn)
				adapterCi.wwnn = hba.wwnn;

			deviceCi.addReferral(adapterCi);

			// prevent dupes
			// We're mapping based on serial number.  I've seen cases where no serial number
			// is available.  In this case, hba.serialNumber will be undefined, so we'll make
			// an entry in the map for "undefined".  This is OK - it just means that we'll
			// map all HBAs without serial numbers to the same record.  That may or may not
			// be correct, but we have no way of knowing without the serial number.
			this._hbaMap['' + hba.serialNumber] = adapterCi;

			if (this.isDebugging())
				Debug.logObject('HBA CI', adapterCi.toShallowObj());
		}
	},

	_processFcPorts: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();
		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });
		var adapterCis = deviceCi.getReferrals('cmdb_ci_storage_hba');

		for (var i = 0; i < results.fcPorts.length; ++i) {
			var port = results.fcPorts[i];

			if (this.isDebugging())
				Debug.logObject('FC Port result', port);

			// correlate the port to HBA via WWNN
			var hbaSerial = (port.hbaSerialNumber || '') + '';
			var portWWPN = StorageWWN.parse(port.wwpn);
			var portWWNN = StorageWWN.parse(port.wwnn);
			var adapterCi = this._hbaMap[hbaSerial || portWWNN];

			// create an adapter if one does not exist
			if (!adapterCi) {
				adapterCi = ciSchema.createCi('cmdb_ci_storage_hba', {
					computer: deviceCi,
					device_id: portWWNN,
					serial_number: portWWNN,
					name: 'Unknown HBA'
				});
				deviceCi.addReferral(adapterCi);

				// See the 'prevent dupes' comment in processFcAdapters above.
				// We now have a way to tell HBAs without serial numbers apart - they'll have
				// different WWNNs. But now we have no way of know which of these HBAs map to
				// HBAs we previously found which didn't have serial numbers.
				// An alternate approach would be to simply not create HBAs in _processFcAdapters
				// (when serial numbers are missing) and to only create them here.  My thinking
				// for the decision went like:
				// We're trying to do the best we can when we have imperfect/incomplete information.
				// Possible situations include:
				//    1) HBAs without serial numbers or WWNNs
				//    2) HBAs without serial numbers but with WWNNs
				//    3) HBAs without serial numbers or ports
				// In case (1) both the code that we have and the alternate approach will collapse
				// multiple HBAs into a single record.  That's the best we can do since we don't
				// have any identifying information for the HBA.
				// In case (2) the code we have will create an unused record for an HBA with no
				// serial number.  That HBA will have model & manufacturer (if available).  Records
				// will also be created for each HBA (based on WWNN) without model & manufacturer.
				// The alternate approach would not create the unused HBA.
				// In case (3) the current code will create a single HBA with model and manufacturer.
				// The alternate approach would create nothing.
				// So the approach I chose may create an extra HBA record, but at least it will have
				// model & manufacturer information that would otherwise be lost.
				this._hbaMap[hbaSerial || portWWNN] = adapterCi;
			}

			var speed = new DiscoveryDataRate((port.speed.split(/ /)[0]), DiscoveryDataRate.Units.GBps);

			var portCi = ciSchema.createCi('cmdb_ci_fc_port', {
				computer: deviceCi,
				controller: adapterCi,
				wwpn: portWWPN,
				wwnn: portWWNN,
				speed: speed.to(DiscoveryDataRate.Units.GFC) + ' GFC',
				port_type: new DiscoveryFcPortType(port.port_type).getPortType(),
				name: 'FC Port ' + portWWPN
			});

			adapterCi.wwnn =  adapterCi.wwnn || portWWNN;

			deviceCi.addReferral(portCi);
			adapterCi.addReferral(portCi);

			// iterate through remote ports, alter+reference+relate disks mapped
			for (var t = 0; t < port.targetPort.length; ++t) {
				var targetPort = port.targetPort[t];

				for (var b = 0; b < targetPort.blockDeviceNames.length; ++b) {
					var blockDeviceName = '' + targetPort.blockDeviceNames[b];
					var diskId = '/dev/' + blockDeviceName;
					var diskCi = this._findStorageDevice(deviceCi, diskId);
					if (diskCi === null) {
						if (this.isDebugging())
							this.warn('Unable to match FC port to device id: ' + diskId);

						continue;
					}

					diskCi.searchTable = 'cmdb_ci_storage_device';   // For Ci class - look for existing rec in the base table, reclassify if needed
					diskCi.table = 'cmdb_ci_fc_disk';
					diskCi.data.device_interface = 'fc';
					diskCi.data.storage_type = 'network';
					diskCi.provided_by = portCi;

					portCi.addReferral(diskCi);

					// populate the wwnn and wwpn for the target path in cmdb_fc_target table
					var targetWWPN = StorageWWN.parse(targetPort.wwpn);
					var targetWWNN = StorageWWN.parse(targetPort.wwnn);
					var targetCi = this.createTargetCi(targetWWNN, targetWWPN);
					diskCi.addReferral(targetCi);

					var initiatorCi = ciSchema.createCi('cmdb_fc_initiator', {
						wwnn: portWWNN,
						wwpn: portWWPN
					});
					diskCi.addReferral(initiatorCi);

					// attempt to relate to upstream volume on array
					try {
						storageReconciler.createFCDiskCiToVolumeRel(diskCi, new Array(targetWWPN), portWWPN);
					} catch (e) {
						if (this.isDebugging())
							this.warn(e);
					}

				}
			}

			if (this.isDebugging())
				Debug.logObject('FC Port CI', portCi.toShallowObj());
		}
	},

	// Create a Ci including wwnn, wwpn information for a path to the fc disk from this linux server
	createTargetCi: function(wwnn, wwpn){
		var ciSchema = this.getCiSchema();
		var wwCi = ciSchema.createCi('cmdb_fc_target', {
				wwnn: wwnn,
				wwpn: wwpn
		});

		return wwCi;
	},

	_findStorageDeviceByMajorMinor: function(deviceCi, majorMinor) {
		var storageDeviceCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		for (var i = 0; i < storageDeviceCis.length; ++i) {
			if (storageDeviceCis[i].data.device_major_minor === majorMinor)
				return storageDeviceCis[i];
		}

		return null;
	},

	_escapeRegex: function(str) {
		return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	},

	_findPartition: function(deviceCi, deviceId) {
		var partitionCis = deviceCi.getReferrals('cmdb_ci_disk_partition');
		for (var i = 0; i < partitionCis.length; ++i) {
			var partitionDeviceId = partitionCis[i].data.disk.data.device_id + partitionCis[i].data.partition_number;
			if (partitionDeviceId  === deviceId)
				return partitionCis[i];
		}

		return null;
	},

	_findDiskOrPartitionByMajorMinor: function(deviceCi, majorMinor) {
		var partitionCis = deviceCi.getReferrals('cmdb_ci_disk_partition');
		for (var i = 0; i < partitionCis.length; ++i) {
			if (partitionCis[i].data.device_major_minor === majorMinor)
				return partitionCis[i];
		}

		var storageDeviceCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		for (i = 0; i < storageDeviceCis.length; ++i) {
			if (storageDeviceCis[i].data.device_major_minor === majorMinor)
				return storageDeviceCis[i];
		}

		return null;
	},

	_findStorageDevice: function(deviceCi, deviceId) {
		var diskCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		for (var i = 0; i < diskCis.length; ++i)  {
			if (diskCis[i].data.device_id === deviceId)
				return diskCis[i];
		}

		return null;
	},

	_findPool: function(deviceCi, poolId) {
		var poolCis = deviceCi.getReferrals('cmdb_ci_storage_pool');
		for (var i = 0; i < poolCis.length; ++i)  {
			if (poolCis[i].data.pool_id === poolId)
				return poolCis[i];
		}

		return null;
	},

	_findIscsiDevice: function(results, deviceId) {
		var iScsiDevice;
		results.sys_iscsi.iscsiSession.some(
			function(session) {
				var device = session.device;
				// When there's only one iSCSI disk, 'device'
				// will be an object containing id & lun.  When
				// there are multiple iSCSI disks, it's an array
				// of objects with id & lun.
				if (device instanceof Array)
					return device.some(checkDevice);
				else if (device)
					return checkDevice(device);

				function checkDevice(device) {
					if ('/dev/' + device.id == deviceId) {
						iScsiDevice = {
							targetIqn: session.targetIqn,
							id: device.id,
							lun: device.lun
						};
						return true;
					}
				}
			});
		return iScsiDevice;
	},

	_findSysBlockByHost: function(results, host, bus, target, lun) {
		var key = host + ':' + bus + ':' + target + ':' + lun;

		for (var i = 0; i < results.sysBlocks.length; ++i) {
			if (results.sysBlocks[i].host === key)
				return results.sysBlocks[i];
		}

		return null;
	},

	_findSysBlockByMajorMinor: function(results, majorMinor) {
		for (var i = 0; i < results.sysBlocks.length; ++i) {
			if (results.sysBlocks[i].deviceMajorMinor === majorMinor)
				return results.sysBlocks[i];
		}

		return null;
	},

	_findSysBlock: function(name) {
		return ( typeof this._sysBlockNameMap[name] === 'undefined' ? null : this._sysBlockNameMap[name] );
	},

	_findProcMount: function(fsName) {
		return ( typeof this._procMountNameMap[fsName] === 'undefined' ? null : this._procMountNameMap[fsName] );
	},

	_findDiskDataSize: function(results, deviceId) {
		var size = ( typeof results.diskSizeMap[deviceId] === 'undefined' ? 0 : results.diskSizeMap[deviceId] );
		return new StorageDataSize(size);
	},

	_getStorageType: function(linuxType) {
		if (typeof DiscoveryLinuxStorageSensor._STORAGE_TYPES[linuxType] === 'undefined')
			return 'logical';

		return DiscoveryLinuxStorageSensor._STORAGE_TYPES[linuxType];
	},

	_reconcileExports: function() {
		var deviceId = ''+this.getCmdbCi();

		var reconciler = new DiscoveryStorageAllocationReconciler();
		reconciler.reconcileFileSystemByServer(deviceId);
	},

	/**
	 *  aggregate all attached disk space for the computer deviceCi (taking mulitpath devices into account)
	 */
	_getAggregateDataSize: function(results, deviceCi) {

		if (JSUtil.nil(results.diskSizeMap))
			return 0;

		//
		// Step 1:
		//  Build an abbreviated map of storage devices that are either direct attached storage,
		//  the root of a multipath storage block device,
		//  LVM devices (that do NOT map to a root multipath block storage device) or
		//  LVM devices (that map to a root multipath block storage device).
		//
		//  Format of abbreviatedDiskSizeMap:
		//    { <deviceId>: {totalBytes: <#>, isTopLevelStorageDevice: <boolean>, isMultipathRootStorageDevice: <boolean>}}
		//
		// Format of "diskSizeMap": {
		//   "/dev/sda": "146778685440",                              <-- a Logical Volume that is standalone
		//                                                                (not mapped to an enclosing storage block device, NOT mpio)
		//   "/dev/mapper/linsv110_rootvg-lv_swap": "2147483648",     <-- LVM device mapped to /dev/sda2 (a partition of /dev/sda)
		//   "/dev/mapper/mpathb": "134217728000",                    <-- root multipath storage device
		//   "/dev/mapper/mpathbp1": "64420360704",                   <-- partition mapped to /dev/mapper/mpathb
		//   "/dev/mapper/linsv110_datavg-lv_mxd10_conf": "264241152" <-- LVM mapped to /dev/mapper/mpathbp1 mpio partition
		//   "/dev/sdd": "134217728000",                              <-- ** Linux Device that IS a mpio path to "/dev/mapper/mpathb" **
		//
		var entry;
		var abbreviatedDiskSizeMap = {};
		var _this = this;

		for (var deviceId in results.diskSizeMap) {

			// Enumerate object properties
			if ( ! results.diskSizeMap.hasOwnProperty(deviceId) )
				continue;

			abbreviatedDiskSizeMap[deviceId] = {};
			entry = abbreviatedDiskSizeMap[deviceId];

			entry.deviceId = deviceId;
			entry.totalBytes = results.diskSizeMap[deviceId];

			// Identify the subset of devices that may be mapped devices
			// 1) multipath root storage block device.
			// 2) multipath partition (mapped to root block storage device)
			// 3) LVM(s) mapped to an enclosing (parent) device.
			// 4) LVM(s) NOT mapped to an enclosing (parent) device **
			// 5) Thinly provisioned devices
			//    The "mappedDevices" type is either "thin" or "thin-pool".
			//    "thin" devices map to the "thin-pool"
			//    "thin-pool" devies maps to a linear device where the linear device maps to an enclosing (parent) device.
            //
			// At this point we do not know if the devive is a LVM, thin device, or a standalone disk (/dev/sd*)
			// Devices are standalone or mapped to a parent (enclosing) device.
			// Mark all devices standalone.
			entry.isTopLevelStorageDevice = true;

			// default to non-multipath (or interior mpio device)
			entry.isMultipathRootStorageDevice = false;
		}

		//
		// Step 2
		//   Identify multi path root block storage devices.
		//   Identify Linux devices (LVM) that are mapped to a multipath device (typically a partition).
		var idx1;

		if (JSUtil.notNil(results.mappedDevices)) {
			//
			// Step 2.1:
			//   Identify devices that are NOT mapped to an enclosing block storage device.
			//   These will be the multipath devices and LVM(s).
			//   Algorithm:
			//   1) Enclosed devices will have an extents array entry where the
			//      deviceMajorMinor and sourceStartSector properties are NOT null.
			//      They will point to the immediately enclosing device
			//      (either the partition or the root device).
			// NOTE:
			//   1) What will not be included are the /dev/sd*(s).
			//      These devices will be handled in Step 3.
			//
			// Format of mappedDevices:
			// "mappedDevices": [
			// {
			//    "alias": "linsv110_rootvg-lv_swap",    <-- storage volume, mapped to a non-mpio device partition
			//                                           <-- storage partitions (mpio or non-mpio) will look similar.
			//    "deviceMajorMinor": "253:1",
			//    "extents": [
			//        {
			//            "startSector": "0",
			//            "endSector": "4194304",
			//            "type": "linear",              <-- NOT a multipath device root
			//            "deviceMajorMinor": "8:2",     <-- reference to enclosing device /dev/sda2 (partition of /dev/sda)
			//            "sourceStartSector": "4196352"
			//        }
			//   ]
			//}, {
			//    "alias": "mpathb",
			//    "deviceMajorMinor": "253:2",
			//    "extents": [
			//    {
			//           "startSector": "0",
			//           "endSector": "262144000",
			//           "type": "multipath",       <-- Multi-path root device (standalone block storage volume)
			//           "deviceMajorMinor":  null, <-- Does NOT reference an enclosing (parent) storage device
			//           "sourceStartSector": null  <-- Does NOT reference a parent device beginning sector number
			//    }
			//   ]
			//}, {
			//    alias": "vgsys-thin--pool",
			//    "deviceMajorMinor": "253:4",
			//    "extents": [
			//    {
			//           "startSector": "0",
			//           "endSector": "23445504",
			//           "type": "thin",           <-- Device type was "thin-pool" which was re-marked as a "thin" device.
			//                                         The "thin-pool" is mapped to a linear device that in turn is mapped to a standalone device.
			//           "deviceMajorMinor": null, <-- Not populated by the Linux-Storage probe (post processor).
			//           "sourceStartSector": null <-- Not populated by the Linux-Storage probe (post processor).
			//    }
			//   ]
			//}, {
			//    "alias": "thin-253:0-52431785-225c021eae64fa34ef6746ea4c53fc752aa68ae164039e8ecaf7d86e3e643781",
			//    "deviceMajorMinor": "253:5",
			//    "extents": [
			//    {
			//           "startSector": "0",
			//           "endSector": "20971520",
			//           "type":      "thin",       <-- A "thin" device is NOT a standalone block storage volume.
			//                                          It is mapped to a "thin-pool" which is mapped to a linear device that finally maps to a standalone device.
			//           "deviceMajorMinor":  null, <-- Not populated by the Linux-Storage probe (post processor).
			//           "sourceStartSector": null  <-- Not populated by the Linux-Storage probe (post processor).
			//    }
			//   ]
			//}
			//
			for (idx1 = 0; idx1 < results.mappedDevices.length; ++idx1) {

				var mappedDevices = results.mappedDevices[idx1];

				entry = getAbbreviatedEntry(mappedDevices);

				// should not happen
				if (JSUtil.nil(entry)) {
					this.warn('DiscoveryLinuxStorageSensor(1): Unable to find abbreviatedDiskSizeMap[] entry for deviceId: ' + deviceId);
					continue;
				}

				// Examine the extents.
				// If the device is mapped to an enclosing (parent) block storage device
				// then the extents will contain an entry where the deviceMajorMinor and
				// sourceStartSector property values are NOT null.
				// The properties point to the enclosing partition or root device.
				// Multipath root devices will have a type of 'multipath'

				// examine the first extent to determine if device is enclosed or top level block storage device
				if (mappedDevices.extents.length > 0) {

					var extent = mappedDevices.extents[0];
					entry.isMultipathRootStorageDevice = (extent.type == 'multipath');

					// device is enclosed iff the extents.deviceMajorMinor is NOT null and the device type is NOT "thin" or "thin-pool"
					// A storage device with a type of "thin" or "thin-pool" indirectly maps to an enclosing device
					entry.isTopLevelStorageDevice = JSUtil.nil(extent.deviceMajorMinor) && extent.type.indexOf("thin") == -1;
				}
			} // end Step2 : for (var idx1 ...)
		} // end if (JSUtil.notNil ...)

		// Step 3
		//   Identify multi path root block storage devices.
		//   Identify Linux devices (/dev/sd*) that are 'paths' to a root multi path storage block.
		if (JSUtil.notNil(results.multipathPools)) {
			//
			// Step 3:
			// Identify linux device nodes that are paths to a root multipath device.
			// Format of mappedDevices:
			// "multipathPools": [
			// {
			//    "alias": "mpathb",  <-- root multipath block storage device (/dev/mapper/mpathb)
			//    "wwnn": "360050768018185110800000000000e49",
			//    "deviceName": "dm-2",
			//    "groups": [
			//       {
			//            "policy": "round-robin 0",
			//            "priority": "50",
			//            "status": "active",
			//            "paths": [
			//                {
			//                    "deviceName": "sdf",  <-- mpio device node that is a path to /dev/mapper/mpathb
			//                    "deviceMajorMinor": "8:80"
			//                },
			//                {
			//                    "deviceName": "sdg",  <-- another mpio device node that is a path to /dev/mapper/mpathb
			//                    "deviceMajorMinor": "8:96"
			//                },
			//                ...
			//            ]
			//        },
			for (idx1 = 0; idx1 < results.multipathPools.length; ++idx1) {

				// This device is the root multi-path device.
				// The multipathPools[x].groups[y].paths[z] lists the set of
				// /dev/sd* that are mapped to this root device.
				var multipathPool = results.multipathPools[idx1];

				entry = getAbbreviatedEntry(multipathPool);

				// should not happen
				if (JSUtil.nil(entry)) {
					this.warn('DiscoveryLinuxStorageSensor(2): Unable to find abbreviatedDiskSizeMap[] entry for deviceId: ' + deviceId);
					continue;
				}

				// Identify the set of Linux Device Names that are paths to the root
				// multipath block storage device.
				for (var idx2 = 0; idx2 < multipathPool.groups.length; ++idx2) {

				    var multipathGroup = multipathPool.groups[idx2];
				    var paths = multipathGroup.paths;

					for (var idx3 = 0; idx3 < paths.length; ++idx3) {

						var linuxDeviceName = '/dev/' + paths[idx3].deviceName;

						entry = abbreviatedDiskSizeMap[linuxDeviceName];

						// should not happen
				        if (JSUtil.nil(entry)) {
					        this.warn('DiscoveryLinuxStorageSensor(3): Unable to find abbreviatedDiskSizeMap[] entry for linuxDeviceName: '
									  + linuxDeviceName);
						} else {
						    // Record this Linux device as a path to the root
						    entry.isTopLevelStorageDevice  = false;
						}

					} // end for (var idx3 ...)
				} // end for (var idx2 ...)
			} // end Step3 : for (var idx1 ...)
		} // end if (JSUtil.notNil ...)

		//
		// Step4:
		//   Calculate total size for the computer's total block storage (taking multi path into account)
		//
		var totalBytes = 0;

		for (deviceId in abbreviatedDiskSizeMap) {

			// Enumerate object properties
			if ( ! abbreviatedDiskSizeMap.hasOwnProperty(deviceId) )
				continue;

			entry = abbreviatedDiskSizeMap[deviceId];

			// Direct Attached Storage or root Multipath Storage Block Device?
			if (entry.isTopLevelStorageDevice) {

				// Ignore entry if addition would cause overflow
				var diskSize = parseInt(entry.totalBytes);
				var temp = totalBytes + diskSize;

				if (!isNaN(temp))
					totalBytes = temp;
				else
					this.warn(
						"DiscoveryLinuxStorageSensor: unable to parse disk size " +
						entry.totalBytes +
						" for Storage Block Device: " + deviceId +
						", deviceCi with sys_id: " + deviceCi.data.sys_id);
			}

		} // end for

		return totalBytes;

		function getAbbreviatedEntry(device) {
			var sysblock,
				deviceId = '/dev/mapper/' + device.alias,
				entry = abbreviatedDiskSizeMap[deviceId];

			if (!entry) {
				// abbreviatedDiskSizeMap was built with the output of fdisk.  fdisk might use the device
				// mapper name instead of its alias.  mappedDevices doesn't contain the name so we have
				// to look up the name in sysblocks.
				sysblock = _this._findSysBlockByMajorMinor(results, device.deviceMajorMinor);
				entry = sysblock && abbreviatedDiskSizeMap['/dev/' + sysblock.name];
			}

			if (!entry)
				_this.warn('DiscoveryLinuxStorageSensor: Unable to find abbreviatedDiskSizeMap[] entry for deviceId: ' + deviceId);

			return entry;
		}
	},

	type: 'DiscoveryLinuxStorageSensor'
});
