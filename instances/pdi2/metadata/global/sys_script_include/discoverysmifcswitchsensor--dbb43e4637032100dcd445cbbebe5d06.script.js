/**
 * Processes Fibre Channel Switch information.
 * @since fuji
 * @author roy.laurie
 */
var DiscoverySmiFcSwitchSensor = Class.create();

DiscoverySmiFcSwitchSensor.prototype = Object.extendsObject(CimSensor, {
	processCim: function(results, deviceCi) {
		this._processSwitch(results, deviceCi);
		var fcPortCis = this._processFcPorts(results, deviceCi);
	},

	_processSwitch: function(results, deviceCi) {
		if (results.fcSwitch[0].NameFormat === 'WWN')
			deviceCi.data.wwnn = new DiscoveryWWN(results.fcSwitch[0].Name).toString();
	},

	_processFcPorts: function(results, deviceCi) {
		if (this.isDebugging())
			Debug.logObject('FC Ports results', results.disks);

		var ciSchema = this.getCiSchema();
		var fcPortCis = {};

		for (var i = 0; i < results.fcPorts.length; ++i) {
			var fcPortData = results.fcPorts[i];

			// zero pad port number in name
			var portNumStr = fcPortData.PortNumber;
			if (portNumStr < 10)
				portNumStr = '0' + portNumStr;

			var wwpn = new DiscoveryWWN(fcPortData.PermanentAddress).toString(),
				portType = new DiscoveryFcPortType(fcPortData.PortType).getPortType(),
				fcPortCi = ciSchema.createCi('cmdb_ci_fc_port', {
					name: fcPortData.Name || 'Port #' + portNumStr,
					device_id: fcPortData.DeviceID,
					wwpn: wwpn,
					port_type: portType,
					controller: null,
					speed: new DiscoveryDataRate(fcPortData.Speed).to(DiscoveryDataRate.Units.GFC) + ' GFC'
				});

			this._setCiLocation(fcPortCi);

			deviceCi.addReferral(fcPortCi);

			fcPortCis[fcPortData._path] = fcPortCi;

			if (portType == 'f') {
				if (!createRelationship('endpoint1', 'endpoint2'))
					createRelationship('endpoint2', 'endpoint1');
			}

			if (this.isDebugging())
				Debug.logObject('FC Port Ci', fcPortCi.toShallowObj());
		}

		return fcPortCis;

		function createRelationship(endpoint1, endpoint2) {
			var endpoint, hostport, computer;

			endpoint = new GlideRecord('cmdb_ci_san_connection');
			endpoint.addQuery(endpoint1 + '.endpoint_id', '' + wwpn);
			endpoint.query();
			if (endpoint.next()) {
				hostport = new GlideRecord('cmdb_ci_fc_port');
				hostport.addQuery('wwpn', endpoint[endpoint2].endpoint_id);
				hostport.query();
				if (hostport.next()) {
					computer = new GlideRecord('cmdb_ci_computer');
					var compExists = computer.get('sys_id', hostport.computer);
					// DEF0076538 Storage CIM Sensor creating empty Computer CI records on discovery
					// safe check as customer suggested that computer record is created empty
					if (compExists) {
						deviceCi.addRelation(new Ci(computer));
						return true;
					}
					return false;
				}
			}
		}

		return false;
	},

    type: 'DiscoverySmiFcSwitchSensor'
});
