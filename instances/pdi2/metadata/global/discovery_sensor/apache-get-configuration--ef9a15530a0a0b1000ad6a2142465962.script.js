new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        var configOpts = this.parseOutput(result.output);
        var gr = this.getCmdbRecord();
        if (!gr)
            return;

        // only update if we haven't updated it before
        if (gr.name.startsWith('Apache Server@')) {
            if (configOpts['Listen'])
                current.name = 'Apache Server@' + configOpts['Listen'];
            else if (configOpts['ServerName'])
                current.name = 'Apache Server@' + configOpts['ServerName'];
        }
		// If mod_jk or mod_proxy is running on the server, their corresponding
		// probes are triggered to collect load-balancing information

		if (!gs.nil(configOpts['MODJK']))
			this.triggerProbe('Apache - Get JK Module', configOpts['CFG_LOCATION']);

		if (!gs.nil(configOpts['MODPROXY']))
			this.triggerProbe('Apache - Get Proxy Module',configOpts['CFG_LOCATION']);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/g);
        var opts = {};

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lineParts = line.split(/\s+/);

            var keyword = lineParts.splice(0, 1);
            var value = lineParts.join(' ');

            if (keyword == 'Listen' || keyword == 'ServerName' || keyword == 'Port' ||
				keyword == 'MODJK' || keyword == 'MODPROXY' || keyword == 'CFG_LOCATION')
                opts[keyword] = value;
        }

        return opts;
    },

	triggerProbe: function(probeName, cfgLocation) {
		var probe = new Probe.get(probeName);
		if (probe) {
			probe.setSource(this.getSource());
            probe.addParameter("cmdb_ci", this.getCmdbCi());
			probe.addParameter("cfg_location", cfgLocation);
			probe.setEccPriority(this.getParameter("priority"));
			probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
			var ssmObject = this.getParameter("ssm_object");
			if (ssmObject)
				probe.addParameter("ssm_object", ssmObject);
			probe.create(this.getAgent(), this.getEccQueueId());
		}
	},

    type: 'DiscoverySensor'
});
