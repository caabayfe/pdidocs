new ProbePostProcessor({
	/**
 	* Runs the probe instance
 	*/
	process : function() {
		if (JSUtil.notNil(output))
			this.parseOutput(output);
	},
	
	parseOutput: function(output) {
		var lines = output.split(/\n/);
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			var homeIndex = line.indexOf("snc_ora_home=");
			if(homeIndex >= 0){
				current.oracle_home = line.replace("snc_ora_home=","").trim();
				continue;
			}
			
			var versionIndex = line.indexOf("snc_ora_version=");
			if(versionIndex >= 0){
				current.version = line.replace("snc_ora_version=","").trim();
				continue;
			}			
		}
	},
	type: "ProbePostProcessor"
});
