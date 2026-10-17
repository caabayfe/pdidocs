new DiscoverySensor({
	
	process: function(result) {
		var props = this.getPropertiesFromOutput(output);
		props['ip_address'] = g_sensor.getSource();
		PuppetSensor.processPuppetMaster(props);
		
		// pass probe parameters needed by the probes 
		// included with 'Puppet Configuration Management' plugin
		var path = [];
		
		if (props['modulepath'])
			path.push(props['modulepath']);
		
		if (props['manifestdir'])
			path.push(props['manifestdir']);
		
		var pathString = path.join(':');
		if (JSUtil.notNil(pathString))
			g_probe_parameters.path = pathString;
		
	},
	
	getPropertiesFromOutput: function(output) {
		var properties = {};
        var lines = (output + '').split('\n');
        
        while (lines.length > 0) {
            var line = lines.shift();
            var parts = line.split(' = ');
			if (parts) {
				var key = parts[0];
				var value = parts[1];
				properties[key] = value;
			}
        }
		
		return properties;
	},
	
	type: "DiscoverySensor"
});
