new ProbePostProcessor({

	/**
     * Runs the probe instance
     */    
	process : function() {
		related_data.packages = [];
		
		var outputFormat = this.getParameter("output_format");
		var windowsSoftwareParser = (JSUtil.nil(outputFormat) || outputFormat != "json") ? new WindowsInstalledSoftwareLegacy() : new WindowsInstalledSoftware();
		
		windowsSoftwareParser.process(output, related_data);
	},

	type: "ProbePostProcessor"
});
