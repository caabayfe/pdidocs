/**
 * Processes WMI results for Windows disks and file systems. Maps NAS and SAN dependencies if possible.
 *
 * @since fuji
 * @author roy.laurie
 */
var DiscoveryWindows2012StorageSensor = Class.create();

/* MSFT_Disk.BusType => cmdb_ci_disk.interface */
DiscoveryWindows2012StorageSensor._DISK_BUS_TYPE_INTERFACES = {
	1: 'scsi',
	2: 'atapi',
	3: 'ata',
	4: 'ieee1394',
	5: 'ssa',
	6: 'fc',
	7: 'usb',
	8: 'raid',
	9: 'iscsi',
	10: 'sas',
	11: 'sata',
	12: 'sd',
	13: 'mmc',
	17: 'nvme'
};

DiscoveryWindows2012StorageSensor.prototype = Object.extendsObject(DiscoveryWindowsStorageMultiSensor, {
	
	init: function() {
		var arr = [ 'MSFT_Disk', 'MSFT_Volume', 'MSFT_Partition', 'MSFT_DiskToPartition', 'MSFT_PartitionToVolume', 'MSFT_iSCSISession', 'MSFT_iSCSISessionToDisk', 'Win32_DiskDrive', 'Win32_MappedLogicalDisk','Win32_LogicalDisk' ];
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

		for (var i = 0; i < result.MSFT_Disk.length; ++i) {
			var disk = result.MSFT_Disk[i];
			if (this.isDebugging())
				Debug.logObject('MSFT_Disk', disk);

			// find the corresponding Win32_DiskDrive for various info
			// currently needed to get scsi host,bus,target,lun. a 2012 method would be preferred.
			// currently "scrape" matching agaist name
			var diskDrive = null;
			for (var j = 0; j < result.Win32_DiskDrive.length; ++j) {
				var drive = result.Win32_DiskDrive[j];
				var nameRegex = 'PHYSICALDRIVE' + disk.Number + '$';
				if (drive.Name.match(nameRegex)) {
					diskDrive = drive;
					break;
				}
			}

			if (diskDrive === null) {
				DiscoveryLogger.warn('Physical drive not found for logical disk with serial ' + 
							disk.SerialNumber + ' (' + disk.FriendlyName + ')',
							'Discovery',
							this.getEccQueueId());
				continue;
			}

			var deviceInterface = this._getDeviceInterfaceForBusType(disk.BusType);
			var table = this._getDiskTableForInterface(deviceInterface);
			var makeModel = MakeAndModelJS.fromNames(disk.Manufacturer, disk.Model, 'hardware');
			
			var diskCi = ciSchema.createCi(table, {
				name: 'Disk #' + disk.Number, // may change across restarts
				device_id: disk.ObjectId,
				storage_type: this._getStorageTypeForInterface(deviceInterface),
				description: disk.FriendlyName,
				serial_number: disk.SerialNumber,
				operational_status: ( disk.OperationalStatus === '1' ? 1 : 2 ), // 1: operational, 2: non-operational
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				computer: deviceCi,
				device_interface: deviceInterface,
				device_bus_id: diskDrive.SCSIBus,
				device_lun: diskDrive.SCSILogicalUnit,
				device_target_id: diskDrive.SCSITargetId,
				device_host_id: diskDrive.SCSIPort,
				device_name: diskDrive.Name // Used for reconcilation
			});
			var size = new StorageDataSize(disk.Size, 'B');
			size.applyToStorageDeviceSize(diskCi);

			deviceCi.addReferral(diskCi);

			// process SAN data
			switch(table) {
			case 'cmdb_ci_disk':
				// populate deprecated fields until fuji+2 release
				diskCi.data.drive_type = diskCi.data.storage_type;
				break;

			case 'cmdb_ci_iscsi_disk':
				var iscsiSessionResult = this._findIscsiSessionResult(disk.ObjectId, result);
				if (iscsiSessionResult === null) {
					this.warn("Unable to create a relationship between ISCSI Disk: " + diskCi.data.name + " and storage server volume due to empty IscsiSessionResult");
					break;
				}

				diskCi.data.iqn = iscsiSessionResult.TargetNodeAddress;
				diskCi.data.initiator_iqn = iscsiSessionResult.InitiatorNodeAddress;

				// attempt to relate to upstream volume on array
				try {
					storageReconciler.createISCSIDiskCiToVolumeRel(diskCi);
				} catch (e) {
					// It is possible they have not discovered storage so not warning without debug on
					if (this.isDebugging())
						this.warn(e);
				}
				
				break;

			case 'cmdb_ci_fc_disk':
				//throw 'FC not implemented';
			}

			if (this.isDebugging())
				Debug.logObject('Disk CI ' + i, diskCi.toShallowObj());
		}
	},

	_findIscsiSessionResult: function(diskObjectId, result) {
		for (var i = 0; i < result.MSFT_iSCSISessionToDisk.length; ++i) {
			var sessionToDisk = result.MSFT_iSCSISessionToDisk[i];
			var matches = sessionToDisk.Disk.match(/\.ObjectId="(.*?)"$/);
			if (matches === null)
				continue;

			var diskId = matches[1].replace(/\\\\/g, '\\');
			if (diskId !== diskObjectId)
				continue;

			matches = sessionToDisk.iSCSISession.match(/\.SessionIdentifier="(.*?)"$/);
			if (matches === null)
				continue;

			var sessionId = matches[1].replace(/\\\\/g, '\\');

			for (var j = 0; j < result.MSFT_iSCSISession.length; ++j) {
				var session = result.MSFT_iSCSISession[j];
				if (session.SessionIdentifier === sessionId)
					return session;
			}
		}

		return null;
	},

	_processPartitions: function(deviceCi, result) {
		var disks = deviceCi.getReferrals('cmdb_ci_storage_device');
		var ciSchema = this.getCiSchema();
		
		//Create disks map
		var disksMap = {};
		
		for (var i = 0; i < disks.length; ++i) {
			disksMap[disks[i].data.device_id.toLowerCase()] = disks[i];
		}
		
		//Create partition-to-disk map
		var partitionToDiskMap = {};
		var matches = null;
		var partitionObjectId = '';
		var diskObjectId = '';
		
		for (i = 0; i < result.MSFT_DiskToPartition.length; ++i) {
			matches = result.MSFT_DiskToPartition[i].Partition.match(/\.ObjectId="(.*)"/);
			
			if (matches === null)
				continue;
			partitionObjectId = matches[1].replace(/\\\\/g, '\\').replace(/\\\"/g,'"').toLowerCase();
			
			matches = result.MSFT_DiskToPartition[i].Disk.match(/\.ObjectId="(.*)"/);
				
			if (matches === null)
				continue;
			diskObjectId = matches[1].replace(/\\\\/g, '\\').replace(/\\\"/g,'"').toLowerCase();
			partitionToDiskMap[partitionObjectId] = disksMap[diskObjectId];
		}
		
		for (var i = 0; i < result.MSFT_Partition.length; ++i) {
			var partition = result.MSFT_Partition[i];
			if (this.isDebugging())
				Debug.logObject('MSFT_Partition', partition);

			// find the associated disk
			var diskCi = (partition.ObjectId)?partitionToDiskMap[partition.ObjectId.toLowerCase()]:null;
			
			//Fallback to original behavior in case no disk was found 
			if (!diskCi) {
				for (var j = 0; j < disks.length; ++j) {
					if (disks[j].data.device_id === partition.DiskId) {
						diskCi = disks[j];
						break;
					}
				}
			}

			if (!diskCi) {
				DiscoveryLogger.warn('MSFT_Disk not found MSFT_Partition', 'Discovery', this.getEccQueueId());
				continue;
			}

			var partitionCi = ciSchema.createCi('cmdb_ci_disk_partition', {
				name: diskCi.data.name + ' Partition #' + partition.PartitionNumber,
				computer: deviceCi,
				disk: diskCi,
				partition_number: partition.PartitionNumber,
				operational_status: ( partition.OperationalStatus === '1' ? 1 : 2 ),
				start_offset: partition.Offset,
				end_offset: parseInt(partition.Size) + parseInt(partition.Offset),
				object_id: partition.ObjectId || "" // Used for Windows 2016
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
		for (var i = 0; i < result.Win32_LogicalDisk.length; i++) {
			var vSerialInfo = result.Win32_LogicalDisk[i];
			var volId = vSerialInfo.DeviceID.trim();
			volumeSerialNumbers[volId] = vSerialInfo.VolumeSerialNumber;
		}
		
		var mountPoints = this._getVolumeIdsToMountPoints(result);

		for (i = 0; i < result.MSFT_Volume.length; ++i) {
			var volume = result.MSFT_Volume[i];

			if (this.isDebugging())
				Debug.logObject('MSFT_Volume', volume);

			// remote file systems will use the NAS child table
			var table = ( volume.DriveType === '4' ? 'cmdb_ci_nas_file_system' : 'cmdb_ci_file_system' ); // 4 = "Remote"

			//TODO: There is a bug in PowerShell/WMI processing that is returning single characters as their decimal representation. Needs fixin'.
			var absolutePath = null;
			if (gs.nil(volume.DriveLetter) || volume.DriveLetter === '0') {
				absolutePath = null;
			} else if (isNaN(volume.DriveLetter)) {
				absolutePath = volume.DriveLetter + ':\\';
			} else {
				absolutePath = String.fromCharCode(volume.DriveLetter) + ':\\';
			}
			var volumeSerialNumber = null;
			if (volume.DriveLetter && volumeSerialNumbers.hasOwnProperty(volume.DriveLetter + ':'))
				volumeSerialNumber = volumeSerialNumbers[volume.DriveLetter + ':'];
			
			// Get real mount point by the volume id
			var volumeId = this._getCleanVolumeId(volume.ObjectId);
			var mountPoint = absolutePath;
			if (mountPoints && mountPoints[volumeId])
				mountPoint = mountPoints[volumeId];
			
			// create a new file system ci. reconciled by name and computer.
			var fileSystemCi = ciSchema.createCi(table, {
				computer: deviceCi,
				mount_point: mountPoint,
				name: ( absolutePath !== null ? absolutePath : volume.FileSystemLabel ),
				media_type: this._getMediaTypeForVolume(volume.DriveType),
				file_system: this._getFileSystemTypeForVolume(volume.FileSystem),
				serial_number: volumeSerialNumber,
				label: volume.FileSystemLabel
			});
			var size = new StorageDataSize(volume.Size, 'B');
			size.applyToStorageVolumeSize(fileSystemCi);
			var free_space = new StorageDataSize(volume.SizeRemaining, 'B');
			free_space.applyToStorageVolumeFreeSpace(fileSystemCi);

			deviceCi.addReferral(fileSystemCi); // reconcile against other file systems found on the device

			// relate the provided_by back to this ci if found
			fileSystemCi.data.provided_by = this._findVolumeProvider(volume, result.MSFT_PartitionToVolume, deviceCi);
			if (fileSystemCi.data.provided_by !== null) {
				fileSystemCi.data.provided_by.addReferral(fileSystemCi);
				volumeToDiskMapper.relateStorageDevice(fileSystemCi);
			}

			if (this.isDebugging())
				Debug.logObject('File System CI', fileSystemCi.toShallowObj());
		}
	},
	
	/**
	 * Finds the matching volume for the WMI results.
	 */
	_findVolumeProvider: function(volumeResult, partitionTovolumeResults, deviceCi) {
		// iterate through partition-to-volume mapping and find by volume object id
		var partitionMaps = [];
		var diskId, offset, partitionObjectId, matches, i;
		
		for (i = 0; i < partitionTovolumeResults.length; ++i) {
			var partitionToVolume = partitionTovolumeResults[i];
			
			matches = partitionToVolume.Volume.match(/.ObjectId="(.*?)"$/);
			if (matches === null)
				continue;

			// In case of 2016 we need to remove '\"' as well
			var objectId = matches[1].replace(/\\\\/g, '\\').replace(/\\\"/g,'"');

			// Sometimes the case is different
			if (objectId.toLowerCase() === volumeResult.ObjectId.toLowerCase())
				partitionMaps.push(partitionToVolume);
		}
				
		//TODO: support raid - multiple partitions
		if (partitionMaps.length !== 1)
			return null;

		matches = partitionMaps[0].Partition.match(/.DiskId="(.*?)",Offset="(\d+)"$/);
		
		// If we have no matches, we need to check fot Windows 2016 format
		if (!matches){
			matches = partitionMaps[0].Partition.match(/.ObjectId="(.*?)"$/);
			
			if (!matches)
				return null;
			// Set partitionObjectId based on Windows 2016 format
			partitionObjectId = matches[1].replace(/\\\\/g, '\\').replace(/\\\"/g,'"');
		}
		else {
			// Set diskId & offset based on Windows 2012 format
			diskId = matches[1].replace(/\\\\/g, '\\');
			offset = matches[2].replace(/\\\\/g, '\\');
		}

		var partitions = deviceCi.getReferrals('cmdb_ci_disk_partition');
		for (i = 0; i < partitions.length; ++i) {
			var partitionCi = partitions[i];
			var diskCi = partitionCi.data.disk;

			// Try to find match using Windows 2012 variables. If not found, try using 2016 values
			if (partitionCi.data.start_offset === offset && diskCi.data.device_id == diskId)
				return partitionCi;
			else if (partitionCi.data.object_id.toLowerCase() === (partitionObjectId && partitionObjectId.toLowerCase())){
				return partitionCi;
			}
		}

		return null;
	},

	_getDeviceInterfaceForBusType: function(busType) {
		if (typeof DiscoveryWindows2012StorageSensor._DISK_BUS_TYPE_INTERFACES[busType] === 'undefined')
			return null;

		return DiscoveryWindows2012StorageSensor._DISK_BUS_TYPE_INTERFACES[busType];
	},


	type: 'DiscoveryWindows2012StorageSensor'
});
