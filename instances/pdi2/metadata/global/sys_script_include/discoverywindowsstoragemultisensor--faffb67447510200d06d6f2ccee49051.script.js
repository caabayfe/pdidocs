var DiscoveryWindowsStorageMultiSensor = Class.create();


/* cmdb_ci_disk.interface => child table of cmdb_ci_storage_device */
DiscoveryWindowsStorageMultiSensor._DEVICE_INTERFACE_TABLES = {
	iscsi: 'cmdb_ci_iscsi_disk',
	fc: 'cmdb_ci_fc_disk',
	raid: 'cmdb_ci_storage_device'
};

/* MSFT_Volume.FileSystem => cmdb_ci_file_system.type */
DiscoveryWindowsStorageMultiSensor._BUS_STORAGE_TYPES = {
	iscsi: 'network',
	fc: 'network',
	raid: 'raid'
};

/* MSFT_Volume.FileSystem => cmdb_ci_file_system.type */
DiscoveryWindowsStorageMultiSensor._VOLUME_DRIVE_TYPE_MEDIA = {
	0: null, // Unknown
	1: null, // Invalid Root Path
	2: 'removable', // Removable,
	3: 'fixed', // Fixed
	4: 'network', // Network
	5: 'cd', // CD-ROM
	6: 'ram' // RAM Disk
};

/* MSFT_Volume.FileSystem => cmdb_ci_file_system.type */
DiscoveryWindowsStorageMultiSensor._VOLUME_FILE_SYSTEMS = {
	NTFS: 'ntfs',
	UDF: 'udf',
	FAT: 'fat'
};

DiscoveryWindowsStorageMultiSensor.prototype = Object.extendsObject(DiscoveryMultiSensor, {
	init: function(resultsFields) {
		DiscoveryMultiSensor.prototype.init.call(this);
		this._result = {};
		this._resultsFields = resultsFields;
	},

	/**
	 * Multisensors call this method multiple times, once for each sub-probe.
	 * We simply aggregate results here and then process them all at once in after().
	 */
	process: function(result) {
		this.setDefaultSave(false); // prevent multisensor from calling update()

		DiscoveryMultiSensor.prototype.process.apply(this, arguments);

		// merge each reuslt into the aggregate instance variable for use in after()
		this._result = JSUtil.union(this._result, result.results.result);
	},

	after: function() {
		DiscoveryMultiSensor.prototype.after.apply(this, arguments);

		if (!this._result.Win32_DiskDrive)
			return;

		this._process(this._result);

		this.update(); // call manually
		this._reconcileExports();
	},

	_process: function(results) {
		// prepare result data
		results.iscsiSessions = [];
		results.fcinfoDetails = [];
		results.fcinfoPorts = [];
		results.fcinfoMappings = [];

		if (typeof results.output !== 'undefined') {
			var jsobj = new JSON().decode(results.output);
			results.iscsiSessions = ( jsobj.current.results.iscsi.iscsiSessions || [] );
			results.fcinfoDetails = jsobj.current.results.fcinfoDetails;
			results.fcinfoPorts = jsobj.current.results.fcinfoPorts;
			results.fcinfoMappings = jsobj.current.results.fcinfoMappings;
						
			delete results.output;
		}
		
		// prepare result data
		this._ensureArray(results, this._resultsFields);

		var deviceCi = this.getDeviceCi();

		// add disks to device ci
		this._processStorageDevices(deviceCi, results);
		// add partitions to device ci
		this._processPartitions(deviceCi, results);
		// add file systems to device ci
		this._processFileSystems(deviceCi, results);
		// add NAS file systems to device ci
		this._processNasFileSystems(deviceCi, results); 
		// add FC HBAs
		this._processFcAdapters(deviceCi, results);
		// add FC Ports
		this._processFcPorts(deviceCi, results);
		// map ports to disks
		this._processFcDisksToPorts(deviceCi, results);
		
		
		// aggregate all attatched disk space and update device capacity as an integer
		var totalBytes = DiscoveryStorageUtilities.getAggregateDataSize(deviceCi);
		deviceCi.data.disk_space = new StorageDataSize(totalBytes).to(StorageDataSize.Units.GB) | 0;
	},

	_processFcAdapters: function(deviceCi, results) {
		var ciSchema = this.getCiSchema();
		var adapterCis = [];
		
		for (var i = 0; i < results.fcinfoDetails.length; ++i) {
			var adapter = results.fcinfoDetails[i];

			if (this.isDebugging())
				Debug.logObject('HBA result', adapter);

			// each hba may be logically presented, rather than physically. identify on serial
			var found = false;
			for (var j = 0; j < adapterCis.length; ++j) {
				if (adapterCis[j].data.serial_number === adapter.sernum) {
					// skip. save the adapter name, though
					adapterCis[j]._temp.adapterNames.push(adapter.adapter);
					found = true;
					break;
				}
			}
			
			if (found)
				continue;
			
			var makeModel = MakeAndModelJS.fromNames(adapter.manfac, adapter.model, 'hardware');
			var manufacturer = '';
			if (JSUtil.notNil(adapter.manfac))
				manufacturer = adapter.manfac.split(/ /)[0];
			
			var ciName = manufacturer + ' ' + adapter.sernum;

			var adapterCi = ciSchema.createCi('cmdb_ci_storage_hba', {
				computer: deviceCi,
				device_id: adapter.sernum,
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				serial_number: adapter.sernum,
				name: ciName
			});

			deviceCi.addReferral(adapterCi);
			adapterCi._temp = { adapterNames: [ adapter.adapter ] }; // for fc port mapping
			adapterCis.push(adapterCi);

			if (this.isDebugging())
				Debug.logObject('HBA CI', adapterCi.toShallowObj());
		}
	},

	_processFcPorts: function(deviceCi, results) {
		var ciSchema = this.getCiSchema();
		var adapterCis = deviceCi.getReferrals('cmdb_ci_storage_hba');
		
		for (var i = 0; i < results.fcinfoPorts.length; ++i) {
			var port = results.fcinfoPorts[i];

			if (this.isDebugging())
				Debug.logObject('FC Info Details', port);

			// find the corresponding HBA by adapter name (temp field)
			var adapterCi = null;
			for (var j = 0; j < adapterCis.length; ++j) {
				if (JSUtil.contains(adapterCis[j]._temp.adapterNames, port.adapter)) {
					adapterCi = adapterCis[j];
					break;
				}
			}

			// skip this port if we unexpectedly cannot find the hba
			if (adapterCi === null) {
				this.warn('Unable to find FC HBA for FC Port: ' + port.PortWWN);
				continue;
			}

			var wwpn = StorageWWN.parse(port.PortWWN);
			var portType = new DiscoveryFcPortType(port.Type.split(/_/)[0]).toString(); // "N_Port" --> "N"
			
			var speed = null;
			try {
				if (port.Speed.length !== 0)
					speed = new DiscoveryDataRate(port.Speed, 'GFC');
			} catch (e) { /* squelch. maybe "unkn" or blank. */ }
			
			var portCi = ciSchema.createCi('cmdb_ci_fc_port', {
				computer: deviceCi,
				controller: adapterCi,
				wwpn: wwpn,
				wwnn: StorageWWN.parse(port.WWN),
				port_type: portType,
				speed: ( speed ? speed.to(DiscoveryDataRate.Units.GFC) + ' GFC' : null ),
				operational_status: ( port.State === 'online' ? 1 : 0 ),
				name: 'FC Port ' + wwpn
			});

			deviceCi.addReferral(portCi);
			adapterCi.addReferral(portCi);

			if (this.isDebugging())
				Debug.logObject('FC Port CI', portCi.toShallowObj());
		}
	},
	
	_processFcDisksToPorts: function(deviceCi, results) {
		var ciSchema = this.getCiSchema();
		var diskCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		var portCis = deviceCi.getReferrals('cmdb_ci_fc_port');
		var storageReconciler = new DiscoveryStorageAllocationReconciler();
		
		var WWNMap = {};      
		getWWNMap();
		
		for (var i = 0; i < results.fcinfoMappings.length; ++i) {
			var adapter = results.fcinfoMappings[i];

			if (this.isDebugging())
				Debug.logObject('FC Mapped Adapter', adapter);
			
			for (var d = 0; d < adapter.devices.length; ++d) {
				var device = adapter.devices[d];

				if (this.isDebugging())
					Debug.logObject('FC Mapped Device', device);
				
				// find the storage device CI based on provided device id
				var diskCi = null;
				var deviceName = device.DeviceName.toLowerCase();
				for (var s = 0; s < diskCis.length; ++s) {
					if (diskCis[s].data.device_name.toLowerCase() === deviceName) {
						diskCi = diskCis[s];
						continue;
					}
				}
				
				if (diskCi === null) {
					this.warn('FC Disk CI not found for DeviceName: ' + device.DeviceName);
					continue;
				}
				
				var mapping = device.mappings[0]; // active path first
				
				if (this.isDebugging())
					Debug.logObject('FC Mapping', mapping);
				
				var targetWWPN = new StorageWWN(mapping.PortWWN).toString();
				var targetWWNN = new StorageWWN(mapping.WWN).toString();
				
				// change the table / type of the disk
				diskCi.table = 'cmdb_ci_fc_disk';
				diskCi.data.storage_type = 'network';
				diskCi.data.device_interface = 'fc';
								
				// related to exported volume on storage array, if possible
				
				diskCi.data.lun = mapping.L;
				
				// A fc target entry
				var targetCi = ciSchema.createCi('cmdb_fc_target', { 
						wwnn: targetWWNN,
						wwpn: targetWWPN
				});
				diskCi.addReferral(targetCi);
				
				// A initiator entry
				var initiator = WWNMap[mapping.WWN + "-" + mapping.PortWWN];
				var initiatorWWN = StorageWWN.parse(initiator.WWN);
				var initiatorWWPN = StorageWWN.parse(initiator.WWPN);
				var initiatorCi = ciSchema.createCi('cmdb_fc_initiator', { 
						wwnn: initiatorWWN,
						wwpn: initiatorWWPN
				});
				diskCi.addReferral(initiatorCi);
				
				try {
					storageReconciler.createFCDiskCiToVolumeRel(diskCi, new Array(targetWWPN), initiatorWWPN);
				} catch (e) {
					if (this.isDebugging())
						this.warn(e);
				}
				
				if (this.isDebugging())
					Debug.logObject('FC Disk', diskCi.toShallowObj());
			}
		}
		
		// Get mapping from target WWNS to initiator WWNS
		function getWWNMap() {

			for (var i = 0; i < results.fcinfoPorts.length; i++) {
				var port = results.fcinfoPorts[i];
				for (var j=0; j < port.targetWWNS.length; j++) {
					var targetWWN = port.targetWWNS[j];
					WWNMap[targetWWN.WWN + "-" + targetWWN.PortWWN] = {WWN: port.WWN, WWPN: port.PortWWN};		
				}
			}		
		}
		
	},

	_getDeviceInterfaceForBusType: function(busType) {
		// Needs to be overriden
	},

	_getDiskTableForInterface: function(iface) {
		if (typeof DiscoveryWindowsStorageMultiSensor._DEVICE_INTERFACE_TABLES[iface] === 'undefined')
			return 'cmdb_ci_disk';

		return DiscoveryWindowsStorageMultiSensor._DEVICE_INTERFACE_TABLES[iface];
	},

	_getMediaTypeForVolume: function(volumeDriveType) {
		if (typeof DiscoveryWindowsStorageMultiSensor._VOLUME_DRIVE_TYPE_MEDIA[volumeDriveType] === 'undefined')
			return null;

		return DiscoveryWindowsStorageMultiSensor._VOLUME_DRIVE_TYPE_MEDIA[volumeDriveType];
	},

	_getFileSystemTypeForVolume: function(volumeFileSystem) {
		if (typeof DiscoveryWindowsStorageMultiSensor._VOLUME_FILE_SYSTEMS[volumeFileSystem] === 'undefined')
			return null;

		return DiscoveryWindowsStorageMultiSensor._VOLUME_FILE_SYSTEMS[volumeFileSystem];
	},

	_getStorageTypeForInterface: function(iface) {
		if (typeof DiscoveryWindowsStorageMultiSensor._BUS_STORAGE_TYPES[iface] === 'undefined')
			return 'logical';

		return DiscoveryWindowsStorageMultiSensor._BUS_STORAGE_TYPES[iface];
	},

	_reconcileNas: function() {
		var deviceId = this.getDeviceCi().data.sys_id;
		var reconciler = new DiscoveryStorageAllocationReconciler();

		var diskGr = new GlideRecord('cmdb_ci_nas_file_system');
		diskGr.addQuery('computer', deviceId);
		diskGr.query();

		while (diskGr.next())
			reconciler.reconcileFileSystem(diskGr);

		reconciler.pruneAbsentMounts(deviceId, 'cmdb_ci_nas_file_system');
	},

	_ensureArray: function(result, fieldNames) {
		for (var i = 0; i < fieldNames.length; ++i) {
			var field = fieldNames[i];
			result[field] = g_array_util.ensureArray(result[field]);
		}
	},

	_processNasFileSystems: function (deviceCi, result){
        var ciSchema = this.getCiSchema();
        var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });
        for (var i = 0; i < result.Win32_MappedLogicalDisk.length; ++i) {
    
            var df = result.Win32_MappedLogicalDisk[i];
            var nasInfo = storageReconciler.getNASInfo(df.ProviderName);
            if (!nasInfo)
                continue;
            
			var dataSize = null;
			try {
                dataSize = new StorageDataSize((df.Size || 0), StorageDataSize.Units.B);
            } catch (e) { /* do nothing */ }
                
            var freeDataSize = null;
			try {
                freeDataSize = new StorageDataSize((df.FreeSpace || 0), StorageDataSize.Units.B);
            } catch (e) { /* do nothing */ }
                
            var fileSystemCi = ciSchema.createCi('cmdb_ci_nas_file_system', {
				name: df.DeviceID,
				mount_point: df.DeviceID,
				file_system: df.FileSystem,
				media_type: 'network',
				computer: deviceCi,
				nas_path: nasInfo.path,
				nas_hostname : nasInfo.hostname ,
				nas_ip_address : nasInfo.ip ? nasInfo.ip : null,
				nas_protocol : df.FileSystem,
                
            });
                
            if (dataSize !== null)
                dataSize.applyToStorageVolumeSize(fileSystemCi);
                
            if (freeDataSize !== null)
                freeDataSize.applyToStorageVolumeFreeSpace(fileSystemCi);
                
            deviceCi.addReferral(fileSystemCi);
                
               
        }
    },
	_reconcileExports: function() {
		var deviceId = ''+this.getCmdbCi();
		var reconciler = new DiscoveryStorageAllocationReconciler();
		reconciler.reconcileFileSystemByServer(deviceId);	
	},

	_getVolumeIdsToMountPoints: function(result){
        if (!result.hasOwnProperty("Win32_MountPoint"))
            return null;
		
		var mountPoints = {};

        for (var i = 0; i<result.Win32_MountPoint.length; i++) {
            var mountPointObj = result.Win32_MountPoint[i];

            // try to extract a Volume with ID if exists.
            var mountPointVolumeId = this._getCleanVolumeId(mountPointObj.Volume);
						
			var mountPoint = mountPointObj.Directory;	
			// Grab the directory by name
			matches = mountPoint.match(/Win32_Directory.Name=\"(.*)\"/i);
			if (matches && matches[1])
				mountPoint = matches[1];
			
			// Remove extra slashes if needed.
			mountPoint = mountPoint.replace(/\\\\/g, "\\");
			
			mountPoints[mountPointVolumeId] = mountPoint;
        }

        return mountPoints;
    },
	
	_getCleanVolumeId: function(volumeId){
		var matches = volumeId.match(/.*?(Volume\{.*\})/i);
		if (matches && matches[1])
			volumeId = matches[1];
		
		return volumeId;
	},
	
    type: 'DiscoveryWindowsStorageMultiSensor'
});
