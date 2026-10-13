/**
 * Processes WMI results for Windows 2008 and earlier disks and file systems. Maps NAS and SAN dependencies if possible.
 *
 * @since fuji
 * @author roy.laurie
 */
var DiscoveryWindows2008StorageMultiSensor = Class.create();

/* Win32_DiskDrive.InterfaceType => cmdb_ci_storage_device.device_interface */
DiscoveryWindows2008StorageMultiSensor._DISK_BUS_TYPE_INTERFACES = {
	SCSI: 'scsi',
	1394: 'ieee1394',
	USB: 'usb',
	HDC: null
};

DiscoveryWindows2008StorageMultiSensor._POWERSHELL_PROBE_ID = '43fbde9237422100dcd445cbbebe5dde';

DiscoveryWindows2008StorageMultiSensor.prototype = Object.extendsObject(DiscoveryWindowsStorageMultiSensor, {
	
	init: function() {
		var arr = [ 'Win32_DiskDrive', 'Win32_DiskPartition', 'Win32_Volume', 'Win32_LogicalDiskToPartition', 'Win32_MappedLogicalDisk', 'Win32_LogicalDisk' ];
		DiscoveryWindowsStorageMultiSensor.prototype.init.call(this, arr);
	},
	
	/**
	 * Processes CMDB updates for storage devices.
	 * @param Ci deviceCi
	 * @param {} result The probe result
	 */
	_processStorageDevices: function(deviceCi, result) {
		var ciSchema = this.getCiSchema();
		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });

		for (var i = 0; i < result.Win32_DiskDrive.length; ++i) {
			var disk = result.Win32_DiskDrive[i];
			if (this.isDebugging())
				Debug.logObject('Win32_DiskDrive', disk);

			var deviceInterface = this._getDeviceInterfaceForBusType(disk.InterfaceType);
			var makeModel = MakeAndModelJS.fromNames(disk.Manufacturer, disk.Model, 'hardware');
			var table = this._getDiskTableForInterface(deviceInterface);

			var iscsiSessionResult = this._findIscsiSessionResult(disk.DeviceID, result);
			if (iscsiSessionResult !== null) {
				table = 'cmdb_ci_iscsi_disk';
				deviceInterface = 'iscsi';
			}

			var storageType = this._getStorageTypeForInterface(deviceInterface);

			var diskCi = ciSchema.createCi(table, {
				name: 'Disk #' + disk.Index, // may change across restarts
				device_id: disk.DeviceID,
				storage_type: storageType,
				description: disk.Caption,
				serial_number: disk.SerialNumber,
				operational_status: ( disk.Status === 'OK' ? 1 : 2 ), // 1: operational, 2: non-operational
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				computer: deviceCi,
				device_interface: deviceInterface,
				device_bus_id: disk.SCSIBus,
				device_lun: disk.SCSILogicalUnit,
				device_target_id: disk.SCSITargetId,
				device_host_id: disk.SCSIPort,
				device_name: disk.DeviceID // Used for reconcilation
			});
			
			var size = new StorageDataSize(disk.Size, 'B');
			size.applyToStorageDeviceSize(diskCi);

			deviceCi.addReferral(diskCi);

			// process some SAN data. FC handled separately
			switch(table) {
			case 'cmdb_ci_disk':
				// populate deprecated fields until fuji+2 release
				diskCi.data.drive_type = diskCi.data.storage_type;
				break;

			case 'cmdb_ci_iscsi_disk':
				diskCi.data.iqn = iscsiSessionResult.targetIqn;
				diskCi.data.initiator_iqn = iscsiSessionResult.initiatorIqn;
					
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
				Debug.logObject('Disk CI ' + i, diskCi.toShallowObj());
		}
        
	},
    
    

	_findIscsiSessionResult: function(diskDeviceId, result) {
		diskDeviceId = diskDeviceId.toLowerCase().replace(/\W/g, '');
		for (var i = 0; i < result.iscsiSessions.length; ++i) {
			var iscsiSession = result.iscsiSessions[i];
			var sessionDeviceId = iscsiSession.deviceId.toLowerCase().replace(/\W/g, '');
			if (sessionDeviceId === diskDeviceId)
				return iscsiSession;
		}

		return null;
	},

	_processPartitions: function(deviceCi, result) {
		var disks = deviceCi.getReferrals('cmdb_ci_storage_device');
		var ciSchema = this.getCiSchema();

		for (var i = 0; i < result.Win32_DiskPartition.length; ++i) {
			var partition = result.Win32_DiskPartition[i];
			if (this.isDebugging())
				Debug.logObject('Win32_DiskPartition', partition);

			// find the associated disk
			var diskName = 'Disk #' + partition.DiskIndex;
			var diskCi = null;
			for (var j = 0; j < disks.length; ++j) {
				if (disks[j].data.name === diskName) {
					diskCi = disks[j];
					break;
				}
			}

			if (diskCi === null) {
				this.warn('Win32_DiskDrive not found Win32_DiskPartition');
				continue;
			}

			var partitionCi = ciSchema.createCi('cmdb_ci_disk_partition', {
				name: diskCi.data.name + ' Partition #' + partition.Index,
				computer: deviceCi,
				disk: diskCi,
				partition_number: partition.Index,
				operational_status: ( partition.Status === 'OK' || gs.nil(partition.Status) ? 1 : 2 ),
				start_offset: partition.StartingOffset,
				end_offset: parseInt(partition.Size) + parseInt(partition.StartingOffset)
			});

			var size = new StorageDataSize(partition.Size, 'B');
			size.applyToDiskPartitionSize(partitionCi);

			diskCi.addReferral(partitionCi);
			deviceCi.addReferral(partitionCi);

			if (this.isDebugging())
				Debug.logObject('Partition CI ' + i, partitionCi.toShallowObj());
		}
	},

	_processFileSystems: function(deviceCi, result) {
		var ciSchema = this.getCiSchema();
		var volumeToDiskMapper = new DiscoveryVolumeToDiskMapper({ debug: this.isDebugging() });
		var volumeSerialNumbers = {};
		for (var i = 0 ; i < result.Win32_LogicalDisk.length; i++) {
			var vSerialInfo = result.Win32_LogicalDisk[i];
			var volId = vSerialInfo.DeviceID.trim();
			volumeSerialNumbers[volId] = vSerialInfo.VolumeSerialNumber;
		}
		
		var mountPoints = this._getVolumeIdsToMountPoints(result);
		
		for (i = 0; i < result.Win32_Volume.length; ++i) {
			var volume = result.Win32_Volume[i];

			if (this.isDebugging())
				Debug.logObject('Win32_Volume', volume);

			// remote file systems will use the NAS child table
			var table = ( volume.DriveType === '4' ? 'cmdb_ci_nas_file_system' : 'cmdb_ci_file_system' ); // 4 = "Remote"

			//TODO: There is a bug in PowerShell/WMI processing that is returning single characters as their decimal representation. Needs fixin'.
			var absolutePath = null;
			if (gs.nil(volume.DriveLetter) || volume.DriveLetter === '0') {
				absolutePath = null;
			} else if (isNaN(volume.DriveLetter)) {
				absolutePath = volume.DriveLetter + '\\';
			} else {
				absolutePath = String.fromCharCode(volume.DriveLetter) + '\\';
			}
			
			var volumeSerialNumber = null;
			if (volume.DriveLetter && volumeSerialNumbers.hasOwnProperty(volume.DriveLetter))
				volumeSerialNumber = volumeSerialNumbers[volume.DriveLetter];
			
			// Get real mount point by the volume id
			var volumeId = this._getCleanVolumeId(volume.DeviceID);
			var mountPoint = absolutePath;
			if (mountPoints && mountPoints[volumeId])
				mountPoint = mountPoints[volumeId];
				
			// create a new file system ci. reconciled by name and computer.
			var fileSystemCi = ciSchema.createCi(table, {
				computer: deviceCi,
				mount_point: mountPoint,
				name: ( absolutePath !== null ? absolutePath : volume.Label ),
				media_type: this._getMediaTypeForVolume(volume.DriveType),
				file_system: this._getFileSystemTypeForVolume(volume.FileSystem),
				serial_number: volumeSerialNumber,
				label: volume.Label
			});
			
			var size = new StorageDataSize(volume.Capacity, 'B');
			size.applyToStorageVolumeSize(fileSystemCi);
			var free_space = new StorageDataSize(volume.FreeSpace, 'B');
			free_space.applyToStorageVolumeFreeSpace(fileSystemCi);

			deviceCi.addReferral(fileSystemCi); // reconcile against other file systems found on the device

			// relate the provided_by back to this ci if found
			var providedBy = this._findVolumeProvider(volume, result.Win32_LogicalDiskToPartition, deviceCi);
			if (providedBy !== null) {
				fileSystemCi.data.provided_by = providedBy;
				providedBy.addReferral(fileSystemCi);

				// update file system media type to reflect disk
				if (providedBy.table === 'cmdb_ci_disk_partition' && providedBy.data.disk.data.storage_type === 'network')
					fileSystemCi.data.media_type = 'network';
					volumeToDiskMapper.relateStorageDevice(fileSystemCi);
			}

			if (this.isDebugging())
				Debug.logObject('File System CI', fileSystemCi.toShallowObj());
		}
	},

	

	/**
	 * Finds the matching volume for the WMI results.
	 */
	_findVolumeProvider: function(volumeResult, partitionToVolumeResults, deviceCi) {
		// iterate through partition-to-volume mapping and find by volume object id
		var partitionMaps = [];
		for (var i = 0; i < partitionToVolumeResults.length; ++i) {
			var partitionToVolume = partitionToVolumeResults[i];
			var matches = partitionToVolume.Dependent.match(/\.DeviceID="(.*?)"$/);
			if (matches === null)
				continue;

			var objectId = matches[1].replace(/\\\\/g, '\\');
			if (objectId === volumeResult.DriveLetter)
				partitionMaps.push(partitionToVolume);
		}

		//TODO: support raid - multiple partitions
		if (partitionMaps.length !== 1)
			return null;

		var matches = partitionMaps[0].Antecedent.match(/\.DeviceID="Disk #(\d+), Partition #(\d+)"$/);
		if (matches === null)
			return null;

		var diskIndex = matches[1].replace(/\\\\/g, '\\');
		var partitionNumber = matches[2].replace(/\\\\/g, '\\');
		var diskName = 'Disk #' + diskIndex;

		var partitions = deviceCi.getReferrals('cmdb_ci_disk_partition');
		for (var i = 0; i < partitions.length; ++i) {
			var partitionCi = partitions[i];
			var diskCi = partitionCi.data.disk;
			if (partitionCi.data.partition_number === partitionNumber && diskCi.data.name === diskName)
				return partitionCi;
		}

		return null;
	},

	_getDeviceInterfaceForBusType: function(busType) {
		if (typeof DiscoveryWindows2008StorageMultiSensor._DISK_BUS_TYPE_INTERFACES[busType] === 'undefined')
			return null;

		return DiscoveryWindows2008StorageMultiSensor._DISK_BUS_TYPE_INTERFACES[busType];
	},
	
	

	type: 'DiscoveryWindows2008StorageMultiSensor'
});
