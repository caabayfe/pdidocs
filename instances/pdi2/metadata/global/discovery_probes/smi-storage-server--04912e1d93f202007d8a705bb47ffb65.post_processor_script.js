ArrayPolyfill;

/*
 * Use CimQuery to query an SMI-S server for storage array information and
 * extract the data we're interested in.
 * I try to keep the result data as small as possible.  Even so, I've seen
 * response payloads up to about 1 MB long.  Extremely large arrays may
 * require additional optimization.
 */
(function() {

var instanceXml = CimQuery.getInstanceXml(probe.getParameter('instance')),
	cimControllerForLunAssociations = [ ],
	cimDiskDrives = [ ],
	cimScsiControllers = [ ],
	cimVolumes = [ ],
	cimPools = [ ],
	cimBackendArrays = [ ],
	// See the CimQuery script include for a description of this structure.
	// These queries will be executed in order.  Some handlers use the results
	// of previous queries, so don't re-order the queries without verifying the
	// handlers.
	// CIM responses can be huge.  We try to execute the largest queries first
	// and to throw away the data we're not interested in to keep the memory
	// strain on the MID server as small as possible.
	// The "SMI - Storage Server" probe stored these queries in the database.  I'm
	// putting the queries here for several reasons:
	//  1. The queries are tightly coupled to the probe/sensor code. Storing them
	//     separately just obfuscates what's going on
	//  2. Queries are structured, without the need to invent and parse a query
	//     language
	//  3. Associated queries can be represented naturally without the need to
	//     create a query tree of some sort
	queries = [ {
		name: 'volumes',
		method: 'Associators',
		parms: {
			ObjectName: instanceXml,
			AssocClass: 'CIM_SystemDevice',
			ResultClass: 'CIM_StorageVolume'
		},
		result: cimVolumes,
		handler: handleVolumes
	}, {
		name: 'controllerForLunAssociations',
		method:	'EnumerateInstances',
		parms: {
			ClassName: 'CIM_ProtocolControllerForUnit'
		},
		result:	cimControllerForLunAssociations,
		handler: handleControllerForLun
	}, {
		name: 'diskDrives',
		method:	'Associators',
		parms: {
			ObjectName:		instanceXml,
			AssocClass:		'CIM_SystemDevice',
			ResultClass:	'CIM_DiskDrive'
		},
		result:	cimDiskDrives,
		queries: [ {
			name: 'diskMedia',
			method: 'Associators',
			filter: function(simplified) { return simplified.Primordial.toLowerCase() == 'true'; },
			parms: {
				ObjectName:		0,
				AssocClass:		'CIM_MediaPresent',
				ResultClass:	'CIM_StorageExtent'
			}
		} ],
		handler: handleDiskDrives
	}, {
		name: 'scsiControllers',
		method: 'Associators',
		parms: {
			ObjectName: 		instanceXml,
			AssocClass:			'CIM_SystemDevice',
			ResultClass:		'CIM_SCSIProtocolController'
		},
		result: cimScsiControllers,
		queries: [{
			name: 'fcPorts',
			method: 'Associators',
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_ProtocolControllerForPort',
				ResultClass: 'CIM_FCPort'
			}
		}, {
			name: 'authorizedTarget',
			method: 'Associators',
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_AuthorizedTarget'
			},
			queries: [{
				name: 'hardwareID',
				method: 'Associators',
				parms: {
					ObjectName: 0,
					AssocClass: 'CIM_AuthorizedSubject'
				}
			}]
		}],
		handler: handleScsiControllers
	}, {
		name: 'pools',
		result: cimPools,
		method: 'Associators',
		parms: {
			ObjectName: instanceXml,
			AssocClass: 'CIM_HostedStoragePool'
		},
		queries: [{
			name: 'poolVolumes',
			method: 'AssociatorNames',
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_AllocatedFromStoragePool',
				ResultClass: 'CIM_StorageVolume'
			}
		}],
		handler: handlePools
	  }, {
		name: 'backendArrays',
		result: cimBackendArrays,
		parms: {
			ObjectName: instanceXml,
			AssocClass: 'CIM_Dependency',
			ResultClass: 'IBMTSSVC_BackendController'
		},
		method: 'Associators',
		handler: handleBackendArrays
	  }],
	volumeMap = { },   // Map from volume identifier to volume
	controllerMap = { },   // Map from controller identifier to controller
	poolVolumeMap = { },   // Map from pool identifier to pool
	fcPorts = { },   // Map from fc port identifier to fc port (so we don't create the same port more than once.)
	result = {
		cmdb_ci_storage_server:     [ ],
		cmdb_ci_disk:				[ ],
		cmdb_ci_storage_pool:		[ ],
		cmdb_ci_storage_volume:		[ ],
		cmdb_ci_storage_controller:	[ ],
		cmdb_ci_fc_port:			[ ],
		cmdb_ci_iscsi_export:		[ ],
		cmdb_ci_fc_export:			[ ]
	},
	protocol = probe.getParameter('schema'),
	port = probe.getParameter('port') || 5989,
	device_instance = probe.getParameter('device_instance'),
	namespace = probe.getParameter('namespace'),
	multipleOperationsSupported = probe.getParameter('multipleOperationsSupported'),
	chunkSize = probe.getParameter('chunk_size');

	// We queried the SMI-S server in CIM - Classify to see if it supports multiple
	// operations.  If it doesn't we use a chunk size of 1, which isn't a multiple
	// operation.
	if (!multipleOperationsSupported || (multipleOperationsSupported.toLowerCase() != 'true'))
		chunkSize = 1;
	else if (chunkSize) {
		try {
			chunkSize = eval('' + chunkSize);
		} catch (e) {
			chunkSize = 1;
			errorHandler('Error in chunkSize: ' + e.toString());
		}
	}

	if (!protocol) {
		protocol = 'http';
		if (port == '5989')
			protocol = 'https';
	}

	// Execute the queries defined above
	CimQuery.query({
		url: protocol + '://' + probe.getParameter('source') + ':' + port,
		credIterator: probe.getCredentials('cim'),
		namespace: probe.getParameter('namespace'),
		probeId: probe.getParameter('probe'),
		queries: queries,
		// Try to get the parameter.  getParameter() returns null if the
		// parm doesn't exist - make sure we have something useful (with the ||
		// operator) and then convert whatever we have from a Java string to
		// the right JavaScript type.
		timeout: +(probe.getParameter('cimquery.timeout') || 15 * 60 * 1000),
		debug: (probe.getParameter('cimquery.debug') || '') + '',
		debugXmlRequest: (probe.getParameter('cimquery.show.xml.request') || '') + '',
		debugXmlResponse: (probe.getParameter('cimquery.show.xml.response') || '') + '',
		debugJsonResponse: (probe.getParameter('cimquery.show.json.response') || '') + '',
		chunkSize: chunkSize || 1,
		errorHandler: errorHandler
	});

// Final processing
postProcess();

result = JsonCi.decircularize(result);

probe.setPostProcessOutput(result);

return { queries: queries };

/*
 * Handler for errors from CimQuery script include
 */
function errorHandler(msg) {
	probe.appendWarning(msg);
}

/*
 * Handler for 'volumes' query.
 *  1. Pull out the stuff we're interested in
 *  2. Remap CIM names to our abbreviated names
 *  3. Save cmdb_ci_storage_volume
 *  4. Map the cmdb_ci_storage_volume so we can find its storage pool later
 */
function handleVolumes() {
	cimVolumes.forEach(
		function(cimVolume) {
			var volume = {
					n: cimVolume.ElementName,   // remapped to 'name'
					l: cimVolume.DeviceID,   // remapped to 'lun'
					v: cimVolume.Name || cimVolume.DeviceID,   // remapped to 'volume_id'
					p: cimVolume.identifier,   // remapped to 'provided_by'
					s: cimVolume.NumberOfBlocks * cimVolume.BlockSize,   // remapped to 'size_bytes'
					f: cimVolume.ConsumableBlocks * cimVolume.BlockSize   // remapped to 'free_space_bytes',
				};

			result.cmdb_ci_storage_volume.push(volume);

			volumeMap[cimVolume.identifier] = volume;
		});
}

/*
 * Handler for controllerForLunAssociations query
 *  1. Shorten Antecedent and Dependent to strings
 *  2. Map the association by the controller - we need to create
 *     cmdb_ci_storage_controllers for every volume controller.
 */
function handleControllerForLun() {
	cimControllerForLunAssociations.forEach(
		function(cimController) {
			var antecedent = getIdentifier(cimController.Antecedent);
			cimController.Antecedent = antecedent;
			cimController.Dependent = getIdentifier(cimController.Dependent);
			controllerMap[antecedent] = 1;

		});

	// Extract identifying information into a single string
	function getIdentifier(obj) {
		if (obj) {
			var keys = Object.keys(obj).sort();
			keys = keys.map(function(key) { return key + ':' + obj[key]; });
			return keys.join('*');
		}
	}
}

/*
 * Handler for diskDrives query
 *  1. Pull out the stuff we're interested in
 *  2. Get the drive size from the associated media
 *  3. Save the cmdb_ci_disk
 */
function handleDiskDrives() {
	cimDiskDrives.forEach(
		function(cimDrive) {
			var media = cimDrive.associations.diskMedia[0],
				disk = {
					n:		cimDrive.ElementName || cimDrive.DeviceID,   // remapped to 'name'
					d:		cimDrive.DeviceID,  // remapped to 'device_id'
					s:		media ? (media.BlockSize * media.NumberOfBlocks) : 0,   // remapped to size_bytes
					// These values need processing in the sensor
					sn:     cimDrive.EMCSerialNumber,
					mf:		cimDrive.EMCManufacturer,
					intf:   cimDrive.Caption
				};

			result.cmdb_ci_disk.push(disk);
		});
}

/*
 * Handler for pools query
 *  1. Pull out the stuff we're interested in
 *  2. Map the pool so we'll be able to associate it with a volume
 *  3. Save the cmdb_ci_storage_pool
 */
function handlePools() {
	cimPools.forEach(
		function(cimPool) {
			var pool = {
					n: cimPool.ElementName,   // remapped to 'name'
					pi: cimPool.PoolID,   // remapped to 'pool_id'
					s: +cimPool.TotalManagedSpace || 0,   // remapped to 'size_bytes'
					f: +cimPool.RemainingManagedSpace || 0   // remapped to 'free_space_bytes'
				};

			cimPool.associations.poolVolumes.forEach( function(cimPoolVolume) { poolVolumeMap[cimPoolVolume.identifier] = pool; });

			result.cmdb_ci_storage_pool.push(pool);
		});
}

/*
 * Handler for scsiControllers query.
 *   The exact meaning of a CIM_ProtocolController is unclear, and
 * different manufacturers return information differently.  The objects we're
 * getting here may be a mix of ProtocolControllers, SCSIProtocolControllers,
 * iSCSIProtocolControllers, iSCSINodes, SCSIFCProtocolControllers,
 * LunMaskingSCSIProtocolControllers, MappingSCSIProtocolControllers and
 * who knows what else.
 * We want two things out of this function:
 *  1. initiators (iqn or wwpn) for storage exports
 *  2. controllers for FC ports
 * I really doubt that we're doing this correctly, but it works for major
 * storage vendors
 */
function handleScsiControllers() {

	var cimFcPorts,
		useIt = findAssociatedStorageID,
		ctrlNameMap = { };

	// Map controllers based on ElementName.  This is
	// necessary for NetApp - iSCSI initiators are
	// associated with ProtocolControllers and don't
	// include the target IQN.
	cimScsiControllers.forEach(
		function(cimScsiController) {
			var id = cimScsiController.DeviceID.split('|');
			if (id.length == 2)
				ctrlNameMap[id[1]] = cimScsiController;
		});

	// Make a pass over the controllers, create an object
	// for all controllers associated with storage
	cimScsiControllers.forEach(processController);

	// Make a second pass over controllers.  This time
	// we'll create objects for any controller that is
	// associated with a volume or with FC ports if
	// we didn't create it the first time.
	useIt = useUnused;
	cimScsiControllers.forEach(processController);
	
	function processController(cimScsiController) {
		var mappedCimCtlr,
			id = '' + cimScsiController.DeviceID,
			name = '' + (cimScsiController.ElementName || id),
			nameFormat = cimScsiController.NameFormat,
			controller = {
				n: name,   // remapped to 'name'
				d: id,   // remapped to 'device_id',
				nameFormat: nameFormat,
				fp: [ ],
				initiators: [ ]
			};

		cimFcPorts = cimScsiController.associations.fcPorts;

		if (!useIt(cimScsiController, controller))
			return;

		if (nameFormat == 3)
			controller.iqn = cimScsiController.Name;   // Deleted from controller, used by export

		controllerMap[cimScsiController.identifier] = controller;
		result.cmdb_ci_storage_controller.push(controller);
		cimScsiController.used = true;

		// nameFormat: 0->Unknown, 1->Other, 2->FC Port WWN, 3->iSCSI Name
		// If the name is 2 or 3, we already have the target WWPN or IQN.
		// If the name format is 0 or 1 we'll try to find a different
		// controller that has the WWPN or IQN.  This code is here for
		// NetApp - we're expecting to find the iSCSIProtocolController
		// associated with NetApp's ProtocolControllers.
		if ((nameFormat != 2) && (nameFormat != 3)) {
			mappedCimCtlr = ctrlNameMap[name];
			if (mappedCimCtlr) {
				// We're now using the iSCSIProtocolController too
				mappedCimCtlr.used = true;
				controller.iqn = mappedCimCtlr.ElementName;
				controller.nameFormat = 3;
			}
		}

		// When we get here, we've created a controller.  See if it's
		// controlling any FC ports.
		cimFcPorts && cimFcPorts.forEach(
			function(cimFcPort) {
				// Controller <-> FC Port is a many to many relationship, so
				// we may have already created the port.  Make sure not to
				// create another.
				var fcPort = fcPorts[cimFcPort.identifier];
				if (!fcPort) {
					fcPort = fcPorts[cimFcPort.identifier] = {
						n: cimFcPort.ElementName,   // remapped to 'name'
						w: cimFcPort.PermanentAddress,  // remapped to 'wwpn'
						pt: cimFcPort.PortType,   // remapped to 'port_type'
						sp: cimFcPort.Speed,   // remapped to 'speed'
						c: controller  // remapped to 'controller'
					};
					result.cmdb_ci_fc_port.push(fcPort);
				}

				// Some controllers for this port may not be FC controllers.
				// Only try to set the WWNN if we have an FC controller.
				if (nameFormat == 2)
					fcPort.wn = cimScsiController.Name;   // remapped to 'wwnn'
				controller.fp.push(fcPort);
			});
	}

	// Used in the first pass over controllers.  Returns truthy when
	// a controller has any authorized storage
	function findAssociatedStorageID(cimScsiController, controller) {
		cimScsiController.associations.authorizedTarget.forEach(
			function(target) {
				target.associations.hardwareID.forEach(
					function(hardwareId) {
						controller.initiators.push('' + hardwareId.StorageID);
					});
				});
		return controller.initiators.length;
	}

	// Used in the 2nd pass over controllers.  Returns truthy when the
	// controller hasn't been used but it does control a volume or FC
	// ports.
	function useUnused(cimScsiController) {
		return (!cimScsiController.used && 
				(controllerMap[cimScsiController.identifier] ||
				(cimFcPorts && cimFcPorts.length)));
	}
}

/*
 * Handler for backendArrays query
 *  This query is currently IBM SVC-specific, but it's going to be executed against
 *  non-IBM devices.  We should either (a) figure out the generic SMI-S class to use,
 *  or (b) make it so we only query IBM SVCs.  I'm not too worried about the extra
 *  query, though, since we're already making hundreds of queries for volumes and
 *  fileshares.
 *
 *  1. Save what we have for the cmdb_ci_storage_server
 *  2. Create a 'controller' for the backend array
 *  3. Associate the backend's FC ports with the controller
 *
 * We're not querying the backend system here, so the amount of data we get is limited.
 */
function handleBackendArrays() {
	cimBackendArrays.forEach(
		function(cimBackendArray) {
			var ports = [ ],
				backendArray = {
					n: (cimBackendArray.ElementName || '').trim(),  // remapped to 'name'
					sn: (cimBackendArray.ProductSerialNumber || '').trim(),  // remapped to 'serial_number'
					// These values need processing in the sensor
					mf: (cimBackendArray.VendorID || '').trim(),
					mi: (cimBackendArray.ProductIdLow || '').trim()
				},
				controller = {
					n: backendArray.n,
					d: backendArray.n,
					nameFormat: 2,  // nameFormat 2 is FC
					fp: ports
				};
			result.cmdb_ci_storage_server.push(backendArray);
			result.cmdb_ci_storage_controller.push(controller);

			cimBackendArray.Wwpn.forEach(
				function(wwpnArray) {
					// I shouldn't have to do a forEach here.  The CimQuery script isn't
					// parsing array values properly (at least it's not working on WWPNs.)
					wwpnArray.forEach(
						function(wwpn) {
							var fcPort = {
								n: wwpn,  // remapped to 'name'
								co: backendArray,  // remapped to 'computer'
								c: controller,  // remapped to 'controller'
								wn: cimBackendArray.WWNN,  // remapped to 'wwnn'
								w: wwpn,   // remapped to 'wwpn'
								pt: 'n'   // remapped to 'port_type'
							};
							ports.push(fcPort);
							result.cmdb_ci_fc_port.push(fcPort);
						});
				});
		});
}

/*
 * Final cleanup.  All queries have completed and all handlers
 * have been called.
 *  1. Fix the volume -> pool relationship
 *  2. Create storage exports
 *  3. Delete temporary data that we don't need to return.
 */
function postProcess() {

	result.cmdb_ci_storage_volume.forEach(
		function(volume) {
			volume.p = poolVolumeMap[volume.p];
		});

	cimControllerForLunAssociations.forEach(
		function(cimController) {
			var controller = controllerMap[cimController.Antecedent],
				volume = volumeMap[cimController.Dependent],
				initiators = controller && controller.initiators;

			initiators.forEach(
				function(initiator) {
					var exportData = {
						st: volume,   // remapped to 'storage'
						e: controller,   // remapped to 'exported_by',
						l: '' + parseInt(cimController.DeviceNumber, 16)
					};
				// nameFormat == 3 -> iSCSI
				// nameFormat == 2 -> FC
				if (controller.nameFormat == 3) {
					result.cmdb_ci_iscsi_export.push(exportData);
					exportData.ii = initiator;  // remapped to 'initiator_iqn'
					exportData.iqn = controller.iqn;
				} else {
					result.cmdb_ci_fc_export.push(exportData);
					exportData.iw = initiator;  // remapped to 'initiator_wwpn'
				}
			});
		});
	
	result.cmdb_ci_storage_controller.forEach(
		function(controller) {
			delete controller.nameFormat;
			delete controller.initiators;
			delete controller.iqn;
		});
}

/*
 * Get a probe parameter or a MID server property
 */
function getProperty(name) {
	// Try to get the parameter.  getParameter() and getProperty() return null if the
	// parm/prop doesn't exist.  Return an empty string in this case.
	var val = probe.getParameter(name) || midConfig.getProperty('mid.' + name) || midConfig.getProperty(name) || '';
	// If we didn't get an empty string in the previous statement, we need to convert
	// the value to a JavaScript string.
	return '' + val;
}

})();
