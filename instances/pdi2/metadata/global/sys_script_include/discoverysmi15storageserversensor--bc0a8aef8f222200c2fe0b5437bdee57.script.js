// Discovery

ArrayPolyfill;
JsonCi;

var DiscoverySmi15StorageServerSensor;

(function() {

var deviceSysId, locationId, device,
	DiscoverySmiStorageServerSensor = Class.create(),
	// Field names are shortened in the payload to keep it as small as possible.
	// This object defines the mapping from short name to full name.
	remap = {
		c: 'controller',
		co: 'computer',
		d: 'device_id',
		e: 'exported_by',
		f: 'free_space_bytes',
		ii: 'initiator_iqn',
		iw: 'initiator_wwpn',
		l: 'lun',
		n: 'name',
		p: 'provided_by',
		pi: 'pool_id',
		pt: 'port_type',
		s: 'size_bytes',
		sd: 'short_description',
		sn: 'serial_number',
		sp: 'speed',
		st: 'storage',
		v: 'volume_id',
		w: 'wwpn',
		wn: 'wwnn'
	},
	// See the JsonCi script for a description of this structure.
	schema = {
		cmdb_ci_storage_server: {
			index: [ 'serial_number' ],
			fixup: fixupStorageServer,
			remap: remap,
			reverseRelations: { usedBy: 'Uses::Used by' }
        },
		cmdb_ci_storage_volume: {
			index: [ 'computer', 'name' ],
			fixup: fixupVolume,
			remap: remap,
			reverseRelations:{computer: 'Contains::Contained by'}
		},
		cmdb_ci_disk: {
			index: [ 'computer', 'device_id' ],
			fixup: fixupDisk,
			remap: remap
		},
		cmdb_ci_storage_pool: {
			index: [ 'hosted_by', 'pool_id' ],
			fixup: fixupStoragePool,
			remap: remap,
			reverseRelations:{hosted_by: 'Contains::Contained by'}
		},
		cmdb_ci_storage_controller: {
			index: [ 'computer', 'device_id' ],
			fixup: fixupStorageController,
			remap: remap,
			relations: { fp: 'Controller for::Controlled by' }
		},
		cmdb_ci_fc_port: {
			index: [ 'computer', 'wwpn' ],
			fixup: fixupFcPort,
			remap: remap
		},
		cmdb_ci_iscsi_export: {
			index: [ 'exported_by', 'storage', 'initiator_iqn' ],
			fixup: fixupIScsiExport,
			remap: remap
		},
		cmdb_ci_fc_export: {
			index: [ 'exported_by', 'storage', 'initiator_wwpn' ],
			fixup: fixupFcExport,
			remap: remap
		}
	},
	validIntfs = { sas: 'sas', scsi: 'scsi', sata: 'sata' };

DiscoverySmi15StorageServerSensor = {
	process: function(sensor, output) {
		var results = JSON.parse(output),
			args = {
				results: results,
				schema: schema,
				isDebugging: sensor.isDebugging()
			};

		device = sensor.getCmdbRecord();
		deviceSysId = device && ('' + device.sys_id);  // device.sys_id only looks like a string.  Convert it to a real string.
		locationId = sensor.getLocationID();

		// prepare() does a few things to all returned objects and then
		// reattaches them, returning the same JS object produced by the probe.
		args.results = JsonCi.prepare(args);
		
		JsonCi.writeJsObject(args);
		JsonCi.writeRelationships(args);
	}
};

function fixupVolume(volume) {
	volume.computer = deviceSysId;
	volume.media_type = 'fixed';
	volume.location = locationId;
	volume.lun = '' + volume.lun;
}

function fixupDisk(disk) {
	disk.computer = deviceSysId;
	disk.storage_type = 'disk';
	disk.drive_type = 'disk';   // deprecated
	disk.location = locationId;

	if (disk.mf) {
		var makeModel = MakeAndModelJS.fromNames(disk.mf, null);
		disk.manufacturer = '' + makeModel.getManufacturerSysID();
		disk.model_id = '' + makeModel.getModelNameSysID();
		disk.device_interface = validIntfs[disk.intf.toLowerCase()];
		disk['interface'] = disk.device_interface;  // An SN bug doesn't allow "disk.interface".  Also this field is deprecated.
	}
}

function fixupStoragePool(pool) {
	pool.hosted_by = deviceSysId;
	pool.short_description = pool.name;
	pool.location = locationId;
}

function fixupStorageController(controller) {
	controller.computer = deviceSysId;
	controller.location = locationId;
}

function fixupFcPort(port) {
	port.computer = port.computer || deviceSysId;
	port.location = locationId;
	port.wwnn = StorageWWN.parse(port.wwnn);
	var parsedWWPN = StorageWWN.parse(port.wwpn);
	var emptyWWPN = '00:00:00:00:00:00:00:00';
	// StorageWWN.parse() should return nothing when it can't parse the WWPN, but it returns
	// all zeros instead. Fixing StorageWWN would have side effects in Windows & Linux storage
	// sensors for existing customers, so we're forced to use this hack instead of handling it at the source StorageWWN.parse().
	// Since some  FcPorts may not have a permanent address(WWPN) so, we are adding this hack to keep this field as empty.
	// Empty WWPN  prevents it from getting inserted to the cmdb.
	port.wwpn = parsedWWPN === emptyWWPN ? undefined : parsedWWPN ;
	port.port_type = new DiscoveryFcPortType(port.port_type).getPortType();
	port.speed = DiscoveryDataRate.toGFC(port.speed) + ' GFC';
}

function fixupIScsiExport(iScsiExport) {
	fixupExport(iScsiExport);
	iScsiExport.name += ' IQN ' + iScsiExport.initiator_iqn;
}

function fixupFcExport(fcExport) {
	fixupExport(fcExport);
	fcExport.name += ' LUN ' + fcExport.storage.lun;
	fcExport.initiator_wwpn = StorageWWN.parse(fcExport.initiator_wwpn);
}

function fixupExport(commonExport) {
	var volume = commonExport.storage;
	
	commonExport.name = volume.name;
	commonExport.export_id = volume.name + '--' + commonExport.exported_by.name;
	commonExport.hosted_by = deviceSysId;
	commonExport.location = locationId;
}

function fixupStorageServer(server) {
	server.usedBy = device;
	var makeModel = MakeAndModelJS.fromNames(server.mf, server.mi, 'hardware');
	server.manufacturer = '' + makeModel.getManufacturerSysID();
	server.model_id = '' + makeModel.getModelNameSysID();
}

})();
