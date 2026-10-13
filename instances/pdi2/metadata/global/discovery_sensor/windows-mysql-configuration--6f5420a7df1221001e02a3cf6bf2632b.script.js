new DiscoverySensor({
	process: function(result) {
		if (JSUtil.nil(result.output))
			return;

		var filename = g_probe.getParameter("configFilePathVal") + '';
		if (filename.indexOf("\\") > -1) {
			current.config_file = filename;
			current.config_directory = filename.substring(0, filename.lastIndexOf("\\"));
		}
		current.myconf = output.trim();
	},
	type: "DiscoverySensor"
});
