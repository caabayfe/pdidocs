new ProbePostProcessor({
	process: function() {
		try {
			// Return the raw output if there's an exception anywhere
			current.results = { raw: output };

			output = JSON.parse(output);

			current.results = {
				fcinfoDetails: createDetails(),
				fcinfoMappings: createMappings(),
				fcinfoPorts: createPorts()
			};
		} catch (e) { current.error = e.toString(); }

		function createDetails() {
			var details = [ ];

			output.forEach(function(out, idx) {
				detail = {
					adapter:  out.Model + '-' + idx,
					node_wwn: out.NodeWWN,
					fabric:   out.FabricName,
					port_wwn: out.PortWWN,
					nports:   out.NumberOfPorts,
					manfac:   out.Manufacturer,
					sernum:   out.SerialNumber,
					model:    out.Model,
					descrp:   out.ModelDescription,
					drvver:   out.DriverVersion,
					fwver:    out.FirmwareVersion,
					drvnam:   out.DriverName
				};

				details.push(detail);
			});

			return details;
		}

		function createMappings() {
			var mappings = [ ];
			output.forEach(function(out, idx) {
				var map = {
					adapter: out.Model + '-' + idx,
					devices: [ ]
				};

				out.Misc.forEach(function(misc) {
					var device = {
						DeviceName: misc.DeviceID,
						B:          misc.ScsiBus,
						T:          misc.ScsiTarget,
						L:          misc.ScsiOSLun,
						mappings: [ {
							FcId:    'x0' + misc.FCID,
							WWN:     misc.FCNWWN,
							PortWWN: misc.FCPWWN,
							L:       misc.FCLun
						} ]
					};

					if (!device.DeviceName)
						return;

					map.devices.push(device);
				});

				mappings.push(map);
			});

			return mappings;
		}

		function createPorts() {
			var ports = [ ];
			output.forEach(function(out, idx) {
				var port = {
					adapter:   out.Model + '-' + idx,
					Type:      getPortType(out.PortType),
					State:     getPortState(out.PortState),
					Speed:     getSpeed(out.PortSpeed),
					WWN:       out.NodeWWN,
					PortWWN:   out.PortWWN,
					targetWWNS:[ ]
				};

				out.Misc.forEach(function(misc) {
					var target = {
						WWN:     misc.FCNWWN,
						PortWWN: misc.FCPWWN
					};

					port.targetWWNS.push(target);
				});

				ports.push(port);
			});

			return ports;

			function getSpeed(speed) {
				// from the HBA_PORTSPEED enumeration
				switch (speed) {
					case 0:
						return 'unknown';
					case 1:
						return '1';
					case 2:
						return '2';
					case 4:
						return '10';
					case 8:
						return '4';
					case 16:
						return '8';
					case 32:
						return '16';
				}

				return '';
			}

			function getPortType(type) {
				// from the HBA_PORTTYPE enumeration
				switch (type) {
					case 1:
						return 'unknown';
					case 2:
						return 'other';
					case 3:
						return 'not_present';
					case 5:
						return 'N_Port';
					case 6:
						return 'NL_Port';
					case 7:
						return 'FL_Port';
					case 8:
						return 'F_Port';
					case 9:
						return 'E_Port';
					case 10:
						return 'G_Port';
					case 20:
						return 'L_Port';
					case 21:
						return 'PTP';
				}

				return '';
			}

			function getPortState(state) {
				// From the HBA_PORTSTATE enumeration
				switch (state) {
					case 1:
						return 'unknown';
					case 2:
						return 'online';
					case 3:
						return 'offline';
					case 4:
						return 'bypassed';
					case 5:
						return 'diagnostics';
					case 6:
						return 'link_down';
					case 7:
						return 'error';
					case 8:
						return 'loopback';
				}

				return '';
			}
		}
	},

});
