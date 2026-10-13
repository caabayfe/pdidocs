new ProbePostProcessor({
	
	/**
     * Runs the probe instance
     */
	process : function() {
		var packages = [];
		var regex = new RegExp("^(\\S+)\\s+(\\S+)", 'gm');
		
		// throw out first header line
		regex.exec(output);

		while (JSUtil.notNil(match = regex.exec(output))) {
			if (match.length < 3)
				continue;
			var pkg = {};
			pkg.name = match[1];
			pkg.version = match[2];
			packages.push(pkg);
		}
		related_data.packages = packages;
	},
	
	type: "ProbePostProcessor"
});
