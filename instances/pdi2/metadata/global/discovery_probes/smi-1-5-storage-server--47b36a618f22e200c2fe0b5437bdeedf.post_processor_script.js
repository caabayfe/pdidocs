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
	volumeMap = { },
	controllerToVolume = { },
	controllerMap = { },
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
			ResultClass: 'CIM_StorageVolume'                  // cmdb_ci_storage_volume
		},
		handlerForEach: handleVolume,
		queries: [ {
			name: 'controllerForLun',
			method: 'References',                             // Used for volume device number (LUN)
			parms: {
				ObjectName: 0,
				Role: "Dependent",
				ResultClass: "CIM_ProtocolControllerForUnit"
			}
		}, {
			name: 'controllerForVolume',
			method: 'Associators',
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_ProtocolControllerForUnit',
				ResultClass: 'CIM_SCSIProtocolController'     // cmdb_ci_storage_controller
			},
			queries: [ {
				name: 'SAP',
				method: 'Associators',
				parms: {
					ObjectName: 0,
					AssocClass: 'CIM_SAPAvailableForElement',
					ResultClass: 'CIM_ProtocolEndpoint'       // cmdb_ci_iscsi_export, cmdb_ci_fc_export
				},
				queries: [ {
					name: 'FCPorts',
					method: 'Associators',
					parms: {
						ObjectName: 0,
						AssocClass: 'CIM_DeviceSAPImplementation',
						ResultClass: 'CIM_FCPort'             // cmdb_ci_fc_port
					}
				} ]
			}, {
				name: 'AuthorizedTarget',
				method: 'Associators',
				parms: {
					"ObjectName": 0,
					"AssocClass": "CIM_AuthorizedTarget",
					"ResultClass": "CIM_AuthorizedPrivilege"  // cmdb_ci_iscsi_export, cmdb_ci_fc_export
				},
				queries: [ {
						name: 'AuthorizedSubject',
						method: 'Associators',
						parms: {
							"ObjectName": 0,
							"AssocClass": "CIM_AuthorizedSubject",
							"ResultClass": "CIM_StorageHardwareID"    // cmdb_ci_iscsi_export, cmdb_ci_fc_export
						}
				} ]
			} ]
		} ],
	}, {
		name: "ConfigurationService",
		method: "Associators",
		parms: {
			ObjectName: instanceXml,
			AssocClass: "CIM_Dependency",
			ResultClass: "CIM_ControllerConfigurationService"
		},
		queries: [
			{
				name: "controllerForPort",
				method: "Associators",
				handlerForEach: handlePortController,
				parms: {
					ObjectName: 0,
					AssocClass: "CIM_Dependency",
					ResultClass: "CIM_SCSIProtocolController"
				},
				queries: [
					{
						name: "FCPort",
						method: "Associators",
						parms: {
							ObjectName: 0,
							"AssocClass": "CIM_Dependency",
							"ResultClass": "CIM_FCPort"
						}
					}
				]
			}
		]
	}, {
		name: "ComponentSystems",
		method: "Associators",
		parms: {
			ObjectName: instanceXml,
			"AssocClass": "CIM_ComponentCS",
		},
		queries: [{
			name: "AllFCPorts",
			method: "Associators",
			handlerForEach: handleFCPort,
			parms: {
				AssocClass: "CIM_SystemDevice",
				ResultClass: "CIM_FCPort",
				ObjectName: 0
			}
		}]
	}, {
		name: 'diskDrives',
		method:	'Associators',
		handlerForEach: handleDiskDrive,
		parms: {
			ObjectName:		instanceXml,
			AssocClass:		'CIM_SystemDevice',
			ResultClass:	'CIM_DiskDrive'
		},
		queries: [ {
			name: 'diskMedia',
			method: 'Associators',
			filter: function(simplified) { return simplified.Primordial.toLowerCase() == 'true'; },
			parms: {
				ObjectName:		0,
				AssocClass:		'CIM_MediaPresent',
				ResultClass:	'CIM_StorageExtent'               // cmdb_ci_disk
			}
		} ],
	}, {
		name: 'pools',
		method: 'Associators',
		handlerForEach: handlePool,
		parms: {
			ObjectName: instanceXml,
			AssocClass: 'CIM_HostedStoragePool'                 // cmdb_ci_storage_pool
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
	}, {
		name: 'backendArrays',
		method: 'Associators',
		handlerForEach: handleBackendArray,
		parms: {
			ObjectName: instanceXml,
			AssocClass: 'CIM_Dependency',
			ResultClass: 'IBMTSSVC_BackendController'          // cmdb_ci_storage_server
		}
	} ],
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
		namespace: namespace,
		probeId: probe.getParameter('probe'),
		queries: queries,
		// Try to get the parameter.  getParameter() returns null if the
		// parm doesn't exist - make sure we have something useful (with the ||
		// operator) and then convert whatever we have from a Java string to
		// the right JavaScript type.
		timeout: +(probe.getParameter('cimquery.timeout') || 60 * 60 * 1000),
		debug: (probe.getParameter('cimquery.debug') || '') + '',
		debugXmlRequest: (probe.getParameter('cimquery.show.xml.request') || '') + '',
		debugXmlResponse: (probe.getParameter('cimquery.show.xml.response') || '') + '',
		debugJsonResponse: (probe.getParameter('cimquery.show.json.response') || '') + '',
		chunkSize: chunkSize || 1,
		errorHandler: errorHandler
	});

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
 *  1. Pull out the stuff we're interested in, save the cmdb_ci_storage_volume
 *  2. Walk through controllers
 *     a. Create the cmdb_ci_storage_controller
 *     b. Create iSCSI or FC exports
 *     c. For FC exports also create FC ports
 */
function handleVolume(cimVolume) {

	var exportMap = {},
    controllerForLun = cimVolume.associations.controllerForLun,
    size,
    freespace;
	
	// Check added for PRB1374892
	if (cimVolume.ThinlyProvisioned == 'true' && cimVolume.CreationClassName == 'HITACHI_StorageVolume') {
		// for Hitachi thinly-provisioned volumes, NumberOfBlocks tells how many blocks are consumed
		size = cimVolume.ConsumableBlocks * cimVolume.BlockSize;
		var consumedSpace = cimVolume.NumberOfBlocks * cimVolume.BlockSize;
		freespace = size - consumedSpace;
	} else {
		size = cimVolume.NumberOfBlocks * cimVolume.BlockSize;
		freespace = cimVolume.ConsumableBlocks * cimVolume.BlockSize;
	}

	var volume = {
		n: cimVolume.ElementName, // remapped to 'name'
		l: cimVolume.DeviceID, // remapped to 'lun'
		v: cimVolume.Name || cimVolume.DeviceID, // remapped to 'volume_id'
		// p: // remapped to 'provided_by' (see handlePools)
		s: size, // remapped to 'size_bytes'
		f: freespace // remapped to 'free_space_bytes',
	};

	volumeMap[cimVolume.identifier] = volume;

	result.cmdb_ci_storage_volume.push(volume);

	cimVolume.associations.controllerForVolume.forEach(processController);

	// We're done with this.  Delete it so the memory can be reclaimed.
	delete cimVolume.associations;

	// Process a single controller
	function processController(cimController) {
		var controller, initiator, deviceId,
			id = '' + cimVolume.DeviceID,
			name = '' + (cimController.ElementName || cimController.DeviceID || id),
			targets = cimController.associations.AuthorizedTarget,
			assoc = targets && targets[0] && targets[0].associations,
			subject = assoc && assoc.AuthorizedSubject,
			sap = cimController.associations.SAP;

		// Ignore this if the volume isn't exported
		if (!subject || !subject.length)
			return;

		// Get the first initiator.  We'll use this to decide if it's ISCSI.
		initiator = subject[0].StorageID;

		if (!controllerToVolume[id]) {
			controllerToVolume[id] = {
				n: name,	// remapped to 'name'
				d: id   	// remapped to 'device_id',
			};
			result.cmdb_ci_storage_controller.push(controllerToVolume[id]);
			controllerMap[cimController.identifier] = controllerMap[cimController.identifier] || controllerToVolume[id];
		}
		controller = controllerToVolume[id];

		deviceId = findDeviceID(cimController, controllerForLun);

		if (isIscsi(initiator))
			createIscsiExports();
		else
			createFCExports();

		function createFCExports() {
			targets.forEach(
				function(target) {
					var subjects = target.associations.AuthorizedSubject;

					subjects && subjects.forEach(
						function(subject) {
							if (!exportMap[subject.StorageID]) {
								exportMap[subject.StorageID] = 1;
								result.cmdb_ci_fc_export.push({
									st: volume,              // remapped to 'storage'
									e: controller,           // remapped to 'exported_by'
									l: deviceId,             // remapped to 'lun'
									iw: subject.StorageID    // remapped to 'initiator_wwpn'
								});
							}
						});
				});

			sap.forEach(
				function(sap) {
					var ports = sap.associations.FCPorts;
					ports.forEach(
						function(cimPort) {
							fcPort = fcPorts[cimPort.identifier];
							if (!fcPort) {
								fcPort = fcPorts[cimPort.identifier] = {
									n: cimPort.ElementName,       // remapped to 'name'
									w: cimPort.PermanentAddress,  // remapped to 'wwpn'
									wn: sap.Name,                 // remapped to 'wwnn'
									pt: cimPort.PortType,         // remapped to 'port_type'
									sp: cimPort.Speed,            // remapped to 'speed'
									c: controller                 // remapped to 'controller'
								};
								result.cmdb_ci_fc_port.push(fcPort);
							}
							controller.fp = controller.fp || [ ];
							if (!controller.fp.some(
								function(port) {
									return port.w == fcPort.w && port.wn == fcPort.wn && port.c == fcPort.c;
								}))
								controller.fp.push(fcPort);
						});
				});
		}

		function createIscsiExports() {
			var iqn;

			sap.some(
				function(sap) {
					if (isIscsi(sap.Name)) {
						// NetApp appends additional data to the end of the IQN,
						// so I'd like to split the valid IQN from the additional
						// data. The only puncuation allowed in an IQN is dash,
						// dot or colon (https://tools.ietf.org/html/rfc3722),
						// but names can be encoded in UTF-8 (which really confuses
						// things.)  I'm taking the easy way out and just ignoring
						// anything after a comma.
						iqn = sap.Name.split(',')[0];
						return true;
					}
				});

			targets.forEach(
				function(target) {
					var subjects = target.associations.AuthorizedSubject;

					subjects && subjects.forEach(
						function(subject) {
							if (!exportMap[iqn]) {
								exportMap[iqn] = 1;
								result.cmdb_ci_iscsi_export.push({
									st: volume,
									e: controller,
									l: deviceId,
									ii: subject.StorageID,
									iqn: iqn
								});
							}
						});
				});

		}
	}

	function findDeviceID(cimController, references) {
		var deviceId,
			reference = references.find(
				function(reference) {
					if (!reference.hasOwnProperty('DeviceNumber'))
						return;

					if (!reference.ante) {
						var antecedent = reference.Antecedent,
							keys = Object.keys(antecedent).sort();

						keys = keys.map(function(key) { return key + ':' + antecedent[key]; });

						reference.ante = keys.join('*');
					}

					return reference.ante == cimController.identifier;
				});

		deviceId = reference && parseInt(reference.DeviceNumber, 16);
		// deviceId may be a number, undefined or NaN.  If it's a number
		// I want to convert it to a string, otherwise I want to return
		// undefined.
		if (deviceId || (deviceId === 0))
			return '' + deviceId;
	}

	function isIscsi(name) {
		return name && ((name.indexOf('iqn') == 0) || (name.indexOf('eui') == 0));
	}
}

function handlePortController(cimController) {

	var cimFCPorts = cimController.associations.FCPort;

	cimFCPorts.forEach(
		function(cimPort) {
			if (fcPorts[cimPort.identifier])
				return;

			var id = '' + cimController.DeviceID,
				name = '' + (cimController.ElementName || id),
				controller = controllerMap[cimController.identifier];

			if (!controller) {
				controller = {
					n: name,	// remapped to 'name'
					d: id,   	// remapped to 'device_id',
					fp: [ ]
				};

				result.cmdb_ci_storage_controller.push(controller);
			}

			fcPort = fcPorts[cimPort.identifier];

			if (!fcPort) {
				fcPort = {
					n: cimPort.ElementName,   // remapped to 'name'
					w: cimPort.PermanentAddress,  // remapped to 'wwpn'
					wn: cimController.Name,    // remapped to 'wwnn'
					pt: cimPort.PortType,   // remapped to 'port_type'
					sp: cimPort.Speed,   // remapped to 'speed'
					c: controller
				};
				fcPorts[cimPort.identifier] = fcPort;
				result.cmdb_ci_fc_port.push(fcPort);
			}
			controller.fp.push(fcPort);
		});
}

/*
 * Handler for FCPort query
 *
 * We found ports that are being used to export volumes earlier.  This will find
 * FC ports that aren't currently being used (or possibly not even installed.)
 */
function handleFCPort(cimPort) {
	if (fcPorts[cimPort.identifier])
		return;

	var fcPort = fcPorts[cimPort.identifier] = {
			n: cimPort.ElementName,   // remapped to 'name'
			w: cimPort.PermanentAddress,  // remapped to 'wwpn'
			pt: cimPort.PortType,   // remapped to 'port_type'
			sp: cimPort.Speed,   // remapped to 'speed'
		};

	result.cmdb_ci_fc_port.push(fcPort);
}

/*
 * Handler for diskDrives query
 *  1. Pull out the stuff we're interested in
 *  2. Get the drive size from the associated media
 *  3. Save the cmdb_ci_disk
 */
function handleDiskDrive(cimDrive) {
	var media = cimDrive.associations.diskMedia && cimDrive.associations.diskMedia[0],
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
}

/*
 * Handler for pools query
 *  1. Pull out the stuff we're interested in
 *  2. Map the pool so we'll be able to associate it with a volume
 *  3. Save the cmdb_ci_storage_pool
 */
function handlePool(cimPool) {
	var pool = {
		n: cimPool.ElementName,   // remapped to 'name'
		pi: cimPool.PoolID,   // remapped to 'pool_id'
		s: +cimPool.TotalManagedSpace || 0,   // remapped to 'size_bytes'
		f: +cimPool.RemainingManagedSpace || 0   // remapped to 'free_space_bytes'
	};

	cimPool.associations.poolVolumes.forEach(
		function(cimPoolVolume) {
			var volume = volumeMap[cimPoolVolume.identifier];
			if (volume)
				volume.p = pool;
		});

	result.cmdb_ci_storage_pool.push(pool);
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
function handleBackendArray(cimBackendArray) {
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
}

})();
