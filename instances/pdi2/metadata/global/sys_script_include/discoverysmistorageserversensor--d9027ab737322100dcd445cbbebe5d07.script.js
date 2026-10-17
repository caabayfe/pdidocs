// Discovery
ArrayPolyfill;
/**
 * Processes SAN & NAS Storage Arrays / Servers per SMI-S.
 * @author roy.laurie
 * @since fuji
 */
var DiscoverySmiStorageServerSensor = Class.create();

DiscoverySmiStorageServerSensor._STORAGE_DEVICE_INTERFACE_TRANSLATIONS = {
	'sas': 'sas',
	'scsi': 'scsi',
	'sata': 'sata',
	'default': null
};

DiscoverySmiStorageServerSensor.prototype = Object.extendsObject(CimSensor, {
	processCim: function(results, deviceCi) {
		var diskCis = this._processDisks(results, deviceCi);
		var poolCis = this._processPools(results, deviceCi);
		var volumeCis = this._processVolumes(results, deviceCi, poolCis);
		var controllers = this._processControllers(results, deviceCi);
		var fcPortCis = this._processFcPorts(results, deviceCi, controllers.pathToCi);

		this._processFcExports(results, deviceCi, volumeCis, controllers);
	},
	
	_processDisks: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();
		var diskCis = {};

		for (var i = 0; i < results.diskDrives.length; ++i) {
			var diskData = results.diskDrives[i];

			if (this.isDebugging())
				Debug.logObject('Disk Drive result', diskData);

			// find the associated media
			var diskMediaData = null;
			for (var j = 0; j < results.diskMedia.length; ++j)  {
				if (results.diskMedia[j]._associations[0].originPath === diskData._path) {
					diskMediaData = results.diskMedia[j];
					break;
				}
			}

			// compute size
			var dataSize;
			if (diskMediaData) {
				dataSize = new StorageDataSize((diskMediaData.NumberOfBlocks * diskMediaData.BlockSize) || 0);
			
				if (this.isDebugging())
					Debug.logObject('Disk Media result', diskMediaData);
			}
			else {
				dataSize = new StorageDataSize(0);				
				this.warn('Unable to find disk media for drive: ' + diskData.DeviceID);
			}
			
			var diskCi = ciSchema.createCi('cmdb_ci_disk', {
				name: diskData.ElementName || diskData.DeviceID,
				device_id: diskData.DeviceID,
				computer: deviceCi,
				storage_type: 'disk',
				drive_type: 'disk' // deprecated
			});
			dataSize.applyToStorageDeviceSize(diskCi);

			this._setCiLocation(diskCi);
			deviceCi.addReferral(diskCi);
			diskCis[diskData._path] = diskCi;

			if (diskData._classname.indexOf('Clar_') === 0) // EMC
				this._processEmcDisk(results, deviceCi, diskData, diskCi);

			if (this.isDebugging())
				Debug.logObject('Disk CI', diskCi.toShallowObj());
		}

		return diskCis;
	},

	/**
	 * Handle EMC-specific storage devices.
	 */
	_processEmcDisk: function(results, deviceCi, diskData, diskCi) {
		diskCi.data.serial_number = diskData.EMCSerialNumber;
		diskCi.data.device_interface = this._translate(diskData.Caption, DiscoverySmiStorageServerSensor._STORAGE_DEVICE_INTERFACE_TRANSLATIONS);

		// make / model
		var makeModel = MakeAndModelJS.fromNames(diskData.EMCManufacturer, null);
		diskCi.data.manufacturer = ''+makeModel.getManufacturerSysID();
		diskCi.data.model_id = ''+makeModel.getModelNameSysID();

		diskCi.data['interface'] = diskCi.data.device_interface; // deprecated
	},

	_processPools: function(results, deviceCi) {
		var ciSchema = this.getCiSchema();
		var poolCis = {};

		for (var i = 0; i < results.pools.length; ++i) {
			var poolData = results.pools[i];

			if (this.isDebugging())
				Debug.logObject('Pool result', poolData);

			var dataSize = new StorageDataSize(poolData.TotalManagedSpace || 0);
			var freespaceSize = new StorageDataSize(poolData.RemainingManagedSpace || 0);

			var poolCi = ciSchema.createCi('cmdb_ci_storage_pool', {
				name: poolData.PoolID,
				pool_id: poolData.PoolID,
				short_description: poolData.ElementName,
				hosted_by: deviceCi
			});
			dataSize.applyToStoragePoolSize(poolCi);
			freespaceSize.applyToStoragePoolFreeSpace(poolCi);

			this._setCiLocation(poolCi);

			deviceCi.addReferral(poolCi);

			poolCis[poolData._path] = poolCi;

			if (this.isDebugging())
				Debug.logObject('Pool CI', poolCi.toShallowObj());
		}

		return poolCis;
	},

	_processVolumes: function(results, deviceCi, poolCis) {
		var ciSchema = this.getCiSchema();
		var volumeCis = {};

		for (var i = 0; i < results.volumes.length; ++i) {
			var volumeData = results.volumes[i];

			if (this.isDebugging())
				Debug.logObject('Volume result', volumeData);

			var providedByCi = null;
			// if this is derived from a pool, find the pool CI
			for (var v = 0; v < results.poolVolumes.length; ++v) {
				var poolVolumeData = results.poolVolumes[v];
				if (poolVolumeData._path !== volumeData._path)
					continue;

				var poolPath = poolVolumeData._associations[0].originPath;
				if (typeof poolCis[poolPath] !== 'undefined')
					providedByCi = poolCis[poolPath];
				else
					this.warn('Unable to find Pool for Volume: ' + volumeData.ElementName);

				break;
			}

			var dataSize = new StorageDataSize((volumeData.NumberOfBlocks * volumeData.BlockSize) || 0);
			var freespaceSize = new StorageDataSize((volumeData.ConsumableBlocks * volumeData.BlockSize) || 0);
			var lun = parseInt(volumeData.DeviceID, 16);
			lun = ( lun != lun ? null : ''+lun ); // if it was a non-integer, set to null. otherwise cast to string

			var volumeCi = ciSchema.createCi('cmdb_ci_storage_volume', {
				computer: deviceCi,
				name: volumeData.ElementName,
				media_type: 'fixed',
				lun: lun,
				volume_id: volumeData.DeviceID,
				provided_by: providedByCi
			});
			dataSize.applyToStorageVolumeSize(volumeCi);
			freespaceSize.applyToStorageVolumeFreeSpace(volumeCi);

			this._setCiLocation(volumeCi);

			deviceCi.addReferral(volumeCi);

			if (providedByCi !== null)
				providedByCi.addReferral(volumeCi);

			volumeCis[volumeData.DeviceID] = volumeCi;

			if (this.isDebugging())
				Debug.logObject('Volume CI', volumeCi.toShallowObj());
		}

		return volumeCis;
	},

	_processControllers: function(results, deviceCi) {
		var controllerPathToInitiator = {};
		
		mapInitiators();
		
		// Handle specific controllers 
		// Get the first one see what type of controller/storage server we are dealing with
		if (results.scsiControllers.length > 0) {
			var controllerClass = results.scsiControllers[0]._classname;
			
            if (controllerClass.indexOf('ONTAP_') === 0)
				return this._processNetAppControllers(results, deviceCi, controllerPathToInitiator);
		}

		return this._processAllOtherControllers(results, deviceCi, controllerPathToInitiator);
		
		function mapInitiators() {
			var hardwareMap = { };      // Hardware ID mapped by origin path

			results.hardwareID.forEach(function(hardware) { hardwareMap[hardware._associations[0].originPath] = hardware.StorageID; });
			results.authorizedTarget.forEach(function(target) { controllerPathToInitiator[target._associations[0].originPath] = hardwareMap[target._path]; });
		}
	},

	// NetApp Controller have the following characteristics:
	// 1. For iSCSI, there are 3 classes - ONTAP_iSCSINode, ONTAP_ProtocolController, ONTAP_iSCSIProtocolController
	//		a. ONTAP_iSCSINode has an iqn but is essentially not needed
	//		b. ONTAP_ProtocolController is the controller and there is a relationiship from the volume to it.
	//		c. ONTAP_iSCSIProtocolController has the relationship from iqn to the appropriate protocol controller.
	// 2. For FC, there are 2 classes - ONTAP_ProtocolController, ONTAP_SCSIFCProtocolController
	//		a. ONTAP_ProtocolController is the controller and there is a relationiship from the volume and FCPort to it
	//		b. ONTAP_SCSIFCProtocolController - Has WWPN, but no way to associate it to the Prototocl Controller. 
	//		   However Not really needed since we have all the information from ONTAP_ProtocolController.
	// The algorithm is to find all ONTAP_ProtocolContoller, create a CI for it. Also, we find the IQN for ISCSI devices
	_processNetAppControllers: function(results, deviceCi, controllerPathToInitiator) {
		var ciSchema = this.getCiSchema();
		var controllerPathToCi = {};
		var controllerIdToIQN = {};
		var idToInitiator = {};
		var controllerIdToCi = {};
		var controllerComputedIdToCi = {};
		var controllers = {};
		
		for (var i = 0; i < results.scsiControllers.length; ++i) {
			var controllerData = results.scsiControllers[i];

			if (this.isDebugging())
				Debug.logObject('SCSI Controller result', controllerData);

			// Only care about protocol controllers here
			if (controllerData.NameFormat === '3' || controllerData.NameFormat === '2')
				continue;

			// Lets find the iqn if any and create mapping
			var iqn = this._findNetAppControllerIQN(results, deviceCi, controllerData);

			var deviceId, name;
			if (iqn) {
				controllerIdToIQN[controllerData.DeviceID] = iqn;
				deviceId = iqn;
				name = iqn;
			}
			else {
				deviceId = controllerData.DeviceID;
				name = controllerData.ElementName || controllerData.DeviceID; 
			}

			idToInitiator[controllerData.DeviceID] = controllerPathToInitiator[controllerData._path];
			
			// Create controller if we have not seen before
			var controllerCi = controllerComputedIdToCi[deviceId];
			if (!controllerCi) {
				controllerCi = ciSchema.createCi('cmdb_ci_storage_controller', {
					name: name,
					device_id: deviceId,
					computer: deviceCi
				});
				
				this._setCiLocation(controllerCi);
				deviceCi.addReferral(controllerCi);
				controllerComputedIdToCi[deviceId] = controllerCi;
			
				if (this.isDebugging())
					Debug.logObject('NetApp Controller CI', controllerCi.toShallowObj());	
			}		
		
			controllerIdToCi[controllerData.DeviceID] = controllerCi;
			controllerPathToCi[controllerData._path] = controllerCi;
		}
		
		// Construct the object to return
		controllers.pathToCi = controllerPathToCi;
		controllers.idToIQN = controllerIdToIQN;
		controllers.idToCi = controllerIdToCi;
		controllers.idToInitiator = idToInitiator;

		return controllers;
	},

	// Helper function to find the IQN, if iSCSI, by relating a ONTAP_ProtocolController to ONTAP_iSCSIProtocolController
	_findNetAppControllerIQN: function(results, deviceCi, protocolControllerData) {
		var iqn;

		for (var i = 0; i < results.scsiControllers.length; ++i) {
			var controllerData = results.scsiControllers[i];

			// Only care about the relationship between ISCSI to ProtocolContoller (e.g. ONTAP_iSCSIProtocolController)
			if (controllerData.NameFormat !== '3')
				continue;
			
			// The DeviceID contains the iqn and the id of the protocol controller split by |
			var arr = controllerData.DeviceID.split("|");
			if (arr.length != 2)
				continue;

			var tiqn = arr[0];			
			var protocolControllerDeviceId = arr[1];
			
			// Lets see if we have a match
			if (protocolControllerData.DeviceID.indexOf(protocolControllerDeviceId) >= 0) {
				iqn = tiqn;
				break;
			}
		}
		
		return iqn;
	},
	
	// Default method to process all other controllers
	_processAllOtherControllers: function(results, deviceCi, controllerPathToInitiator) {
		var ciSchema = this.getCiSchema();
		var controllerPathToCi = {};
		var controllerIdToIQN = {};
		var controllerIdToCi = {};
		var controllers = {};
		var idToInitiator = {};
		
		for (var i = 0; i < results.scsiControllers.length; ++i) {
			var controllerData = results.scsiControllers[i];

			if (this.isDebugging())
				Debug.logObject('SCSI Controller result', controllerData);

			if (controllerData.NameFormat === '3') {
				controllerIdToIQN[controllerData.DeviceID] = controllerData.Name;
			}
			
			idToInitiator[controllerData.DeviceID] = controllerPathToInitiator[controllerData._path];
			
			var controllerCi = controllerIdToCi[controllerData.DeviceID];
			if (!controllerCi) {
				controllerCi = ciSchema.createCi('cmdb_ci_storage_controller', {
					name: ( controllerData.ElementName || controllerData.DeviceID ),
					device_id: controllerData.DeviceID,
					computer: deviceCi
				});

				this._setCiLocation(controllerCi);
				deviceCi.addReferral(controllerCi);
				controllerIdToCi[controllerData.DeviceID] = controllerCi;

				if (this.isDebugging())
					Debug.logObject('Controller CI', controllerCi.toShallowObj());			

			}

			controllerPathToCi[controllerData._path] = controllerCi;			
		}
		
		// Construct the object to return
		controllers.pathToCi = controllerPathToCi;
		controllers.idToIQN = controllerIdToIQN;
		controllers.idToCi = controllerIdToCi;
		controllers.idToInitiator = idToInitiator;
		
		return controllers;
	},
	
	_processFcPorts: function(results, deviceCi, controllerPathToCi) {
		var ciSchema = this.getCiSchema();
		var fcPortCis = {};

		for (var i = 0; i < results.fcPorts.length; ++i) {
			var fcPortData = results.fcPorts[i];

			if (this.isDebugging())
				Debug.logObject('FC Port result', fcPortData);

			var controllerCis = [];
			// Don't expect m2m relationships here, but get all of them
			for (var a = 0; a < fcPortData._associations.length; ++a) {
				var controllerCimPath = fcPortData._associations[a].originPath;

				// It is possible to not have a mapping because it is not pointing to an actual physical controller, so don't worry about it
				if (!controllerPathToCi[controllerCimPath])
					continue;

				var controllerCi = controllerPathToCi[controllerCimPath];
				controllerCis.push(controllerCi);    
			}
			
			var fcPortCi = ciSchema.createCi('cmdb_ci_fc_port', {
				name: fcPortData.ElementName,
				wwpn: new DiscoveryWWN(fcPortData.PermanentAddress).toString(),
				port_type: new DiscoveryFcPortType(fcPortData.PortType).getPortType(),
				speed: new DiscoveryDataRate(fcPortData.Speed).to(DiscoveryDataRate.Units.GFC) + ' GFC',
				short_description: fcPortData.ElementName,
				computer: deviceCi,
				//controller: controllerCis.length > 0 ? controllerCis[0] : null
				controller: null
			});
			

			this._setCiLocation(fcPortCi);
			deviceCi.addReferral(fcPortCi);

			// Create all relationships to be safe
			for (var j=0; j < controllerCis.length; j++) 
				controllerCis[j].addRelation(fcPortCi);
			
			if (controllerCis.length > 0)
				controllerCis[0].addReferral(fcPortCi);
			
			fcPortCis[fcPortData._path] = fcPortCi;

			if (this.isDebugging())
				Debug.logObject('FC Port CI', fcPortCi.toShallowObj());
		}

		return fcPortCis;
	},

	_processFcExports: function(results, deviceCi, volumeCis, controllers) {
		var ciSchema = this.getCiSchema();
		var controllerIdToIQN = controllers.idToIQN;
		var idToInitiator = controllers.idToInitiator;
		var controllerIdToCi = controllers.idToCi;
		var skippedControllers = controllers.skippedControllers;
		var seenExportIds = {};
		
		for (var i = 0; i < results.controllerForLunAssociations.length; ++i) {
			var assocData = results.controllerForLunAssociations[i];

			if (this.isDebugging())
				Debug.logObject('Controller For LUN result', assocData);

			// find both the controller and volume CIs for the association
			var controllerDeviceId = assocData._key.DeviceID[0];
			var volumeId = assocData._key.DeviceID[1];
	
			// We reconcile based on initator -- if this is not there (which is possible), just move on.
			var initiator = idToInitiator[controllerDeviceId];
			if (!initiator)
				continue;
			
			// find volume
			var volumeCi = volumeCis[volumeId];
			if (!volumeCi) {
				this.warn('Unable to find exported Volume: ' + volumeId);
				continue;
			}

			// find controller
			var controllerCi = controllerIdToCi[controllerDeviceId];
			if (!controllerCi) {
				// Dont warn if we know we skipped the controller
				if (!skippedControllers || !skippedControllers[controllerDeviceId])
					this.warn('Unable to find exporting Controller: ' + controllerDeviceId);
				
				continue;
			}

			// Have we seen this before, then no need to create another
			var exportId = volumeCi.data.name + '--' + controllerCi.data.device_id;
			if (seenExportIds[exportId])
				continue;
			seenExportIds[exportId] = true;
			
			// Create export ci
			var iqn = controllerIdToIQN[controllerDeviceId];
			var exportCi;
			var mappedLun = ''+parseInt(assocData.DeviceNumber, 16);
			if (iqn) 
				exportCi = ciSchema.createCi('cmdb_ci_iscsi_export', {
					export_id: exportId,
					storage: volumeCi,
					exported_by: controllerCi,
					hosted_by: deviceCi,
					iqn: iqn,
					initiator_iqn: initiator,
					lun: mappedLun,
					name: volumeCi.data.name + ' IQN ' + iqn
				});
			else {
				exportCi = ciSchema.createCi('cmdb_ci_fc_export', {
					export_id: exportId,
					storage: volumeCi,
					exported_by: controllerCi,
					hosted_by: deviceCi,
					lun: mappedLun,
					initiator_wwpn: StorageWWN.parse(initiator),
					name: volumeCi.data.name + ' LUN ' + mappedLun
				});
			}
			volumeCi.addReferral(exportCi);
			controllerCi.addReferral(exportCi);
			deviceCi.addReferral(exportCi);

			if (this.isDebugging())
				Debug.log('FC Export CI', exportCi.toShallowObj());
		}
	},

	_translate: function(value, translationMap) {
		var key = value.toLowerCase();
		if (typeof translationMap[key] !== null)
			return key;

		return translationMap['default'];
	},

	type: 'DiscoverySmiStorageServerSensor'
});
