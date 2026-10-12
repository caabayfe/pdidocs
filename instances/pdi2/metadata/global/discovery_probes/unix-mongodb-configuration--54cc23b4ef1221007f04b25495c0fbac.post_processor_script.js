new ProbePostProcessor({
	/**
     * Runs the probe instance
     */
	process : function() {

		current.mongodb_conf = output.trim();
		
		var filename = g_probe.getParameter("filename") + '';
		// Remove unnecessary quotes due to space in filename
		filename = filename.replace(/['"]+/g, '');
		if (filename.indexOf("/") > -1) {
			current.config_file = filename;
			current.config_directory = filename.substring(0, filename.lastIndexOf("/"));
		}

		// port will be set by classify if specified on command line
		var param_port_set = (g_probe.getParameter("port_set") == "true");
		if (param_port_set)
			return;

		var lines = output.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			if (line == '' || line.startsWith('#'))
				continue;
			
			var parts = line.indexOf("=") > 0 ? line.split("=") : line.split(":");
			var name = parts[0].trim();
			var value = parts[1].trim();
			
			if (name=='port') {
				current.tcp_port = value;
				break;		// no longer need to search the file
			}
		}
		if (!current.tcp_port)
			current.tcp_port = "27017";
	},
	
	type: "ProbePostProcessor"
});	
