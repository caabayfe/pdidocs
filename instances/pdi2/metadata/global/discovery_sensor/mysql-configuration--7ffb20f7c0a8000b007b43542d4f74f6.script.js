new DiscoverySensor({
    process: function(result) {
        if (JSUtil.nil(result.output))
            return;

		var filename = g_probe.getParameter("filename") + '';
		if (filename.indexOf("/") > -1) {
			current.config_file = filename;
			current.config_directory = filename.substring(0, filename.lastIndexOf("/"));
		}

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        current.myconf = output.trim();
    },

    type: "DiscoverySensor"
});
