new ProbePostProcessor({
	/**
 	* Runs the probe instance
 	*/
	process : function() {
		if (JSUtil.notNil(output))
			current.version = this.parseOutput(output);
	},
	parseOutput: function(output) {
		var lines = output.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var indx = line.indexOf(" Ver ");
			if ( indx > -1) {
				var version = line.substring(indx + 5);
				version = version.substring(0, version.indexOf(" "));
				return version;
			}
		}
	},
	type: "ProbePostProcessor"
});
