// Discovery
/**
 * Processes WBEM Service information.
 * @author roy.laurie
 */
var DiscoverySmiWbemServiceSensor = Class.create();

DiscoverySmiWbemServiceSensor.prototype = Object.extendsObject(CimSensor, {
	processCim: function(results, deviceCi) {
		this._processServiceAdapters(results, deviceCi);
		
		var profileCis = this._processProfiles(results, deviceCi);
	},
	
	_processServiceAdapters: function(results, deviceCi) {
		if (this.isDebugging())
			Debug.logObject('CIM Service Adapter results', results.serviceAdapters);
		
		var ports = [];
		var dGr = new GlideRecord(deviceCi.table);
		if (dGr.get(deviceCi.data.sys_id))
			ports = dGr.getValue('tcp_port').split(',');
		
		for (var i = 0; i < results.serviceAdapters.length; ++i) {
			var serviceAdapterData = results.serviceAdapters[i];
			if (typeof serviceAdapterData.PortNumber === 'undefined')
				continue;
			
			if (!JSUtil.contains(ports, serviceAdapterData.PortNumber))
				ports.push(serviceAdapterData.PortNumber);
		}

		deviceCi.data.tcp_port = ports.join(',');
	},

	_processProfiles: function(results, deviceCi) {
		if (this.isDebugging())
			Debug.logObject('CIM Profile results', results.profiles);
		
		var ciSchema = this.getCiSchema();
		var profileCis = {};
		
		var highestVersion = null;
		
		for (var i = 0; i < results.profiles.length; ++i) {
			var profileData = results.profiles[i];

			var profileCi = ciSchema.createCi('cmdb_ci_cim_profile', {
				name: profileData.RegisteredName,
				version: profileData.RegisteredVersion,
				cimom: deviceCi,
			});
			
			deviceCi.addReferral(profileCi);			
			
			profileCis[profileData._path] = profileCi;
			
			if (this.isDebugging())
				Debug.logObject('CIM Profile Ci', profileCi.toShallowObj());
			
			// tally the highest SNIA (SMI-S) version for any profile and set that as the device's version
			if (profileData.RegisteredOrganization === '11') {
				if (highestVersion === null || new Version(profileData.RegisteredVersion).greaterThan(highestVersion)) {
					highestVersion = profileData.RegisteredVersion;
					deviceCi.data.smi_version = profileData.RegisteredVersion;
				}
			}
		}

		return profileCis;
	},
	
    type: 'DiscoverySmiWbemServiceSensor'
});
