new ProbePostProcessor({
	process: function() {
		var gOutput = output;
		var gCurrent = current;
		
		var sectionParser = new DiscoveryProbeOutputSectionParser({
			jsonSections: [ 'iscsi', 'warning']
		});

		var results = sectionParser.parse(gOutput);

		var fcinfoDetails = [];
		var fcinfoPorts = [];
		var fcinfoMappings = [];

		// prase FC probe output, if available
		if (typeof results.fcinfo_details !== 'undefined') {
			var fcinfoParser = new DiscoveryFcInfoParser();
			fcinfoDetails = fcinfoParser.parseDetails(results.fcinfo_details);
			fcinfoPorts = fcinfoParser.parsePorts(results.fcinfo_ports);
			fcinfoMappings = fcinfoParser.parseFcpMap(results.fcinfo_fcpmap);
		}
		
		gCurrent.results = {
			fcinfoDetails: fcinfoDetails,
			fcinfoMappings: fcinfoMappings,
			fcinfoPorts: fcinfoPorts,
			iscsi: ( results.iscsi || {} )
		};
		
		// Log the warnings. Would be nice to have support for warnings
		if (results.warning)
			this.log(results.warning.warning);
		
	},

	type: 'WindowsStorage2008ProbePostProcessor'
});
