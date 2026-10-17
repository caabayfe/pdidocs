new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
	 var lines = output.split('\nlistener_name=');
	 if (lines.length > 1)
             current.scan_listener_name = lines.pop().split(',')[0];
	 lines = lines.join('').split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            var versionMatch = line.match(/^snc_ora_version=(\d+(?:\.\d+)+)$/);
            if (versionMatch) {
                current.version = versionMatch[1];
                continue;
            }

            var instanceMatch = line.match(/^snc_ora_instances=([\w\s]+)$/);
            if (instanceMatch) {
                var instances = instanceMatch[1].split(" ");
                for (var n = 0; n < instances.length; n++)
                    this.makeInstanceConnection(instances[n]);
                continue;
            }

            var configFileMatch = line.match(/^snc_listener.ora_contents=$/);
            if (configFileMatch) {
                current.configuration = this.readConfigFile(lines, i + 1);
                break;
            }

            var errorMatch = line.match(/^snc_error=(.+)$/);
            if (errorMatch)
                this.processError(errorMatch[1]);
        }
    },

    readConfigFile: function(lines, start) {
        var config="";
        for (var i = start; i < lines.length; i++)
            config += lines[i] + "\n";
        return config;
    },

    makeInstanceConnection: function(instance) {
        var gr = new GlideRecord("cmdb_ci_db_ora_instance");
        gr.addQuery("sid", instance);
        gr.query();

        if (gr.next() && this.isRunningInstance(gr)) {
            this.fixBackwardsConnections(gr);
            g_disco_functions.createRelationshipIfNotExists(this.getCmdbRecord(), gr, "Depends on::Used by");
        }
    },

    isRunningInstance: function(instanceGR) {
        return g_disco_functions.relationshipExists(instanceGR, g_device.getSourceCmdbCi(), "Runs on::Runs");
    },

    /**
     * Oracle's default config leaves a persistent TCP connection from instance -> listener, which is misleading, 
     * and can cause us to draw inappropriately reversed connections in DiscoveryProcessConnectionsSensor.
     */
    fixBackwardsConnections: function(instanceGR) {
        var gr = g_disco_functions.relationshipExists(instanceGR, this.getCmdbRecord(), "Depends on::Used by");
        if (!gr)
            return;
		
        // If the reversed relationship already exists, lets delete the misleading one made by ADM
        if (g_disco_functions.relationshipExists(this.getCmdbRecord(), instanceGR, "Depends on::Used by"))
	       gr.deleteRecord();
		
        // If the reversed relationship does not already exist, lets reverse the one made by ADM
        else {
            var parent = gr.getValue("parent");
            gr.setValue("parent", gr.getValue("child"));
            gr.setValue("child", parent);
            gr.update();
        }
    },

    type: "DiscoverySensor"
});
