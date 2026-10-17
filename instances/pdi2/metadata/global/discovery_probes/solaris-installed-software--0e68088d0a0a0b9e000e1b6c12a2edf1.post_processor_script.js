new ProbePostProcessor({
	
	/**
     * Runs the probe instance
     */
	process : function() {
		var packages = [];
		var softwareMatch = {};
		var softwareArray = [];
		var token;
		
		var line = output.split('\n');
		for (var i = 0; i < line.length; i++) {
			if (line[i].indexOf(':') != -1) {
				token = line[i].split(':');
				for (var k = 0; k < token.length; k++)
					token[k] = token[k].replace(/^\s*/, "");
				
				softwareMatch[token[0]] = token[1];
			}
			
			if (line[i] == '' || line.length - i == 1) {
				softwareArray.push(softwareMatch);
				softwareMatch = {};
			}
		}
		
		for (var j = 0; j < softwareArray.length; j++) {
			softwareMatch = softwareArray[j];
			
			var pkg_name = softwareMatch.PKGINST;
			var name     = softwareMatch.NAME;
			var cat      = softwareMatch.CATEGORY;
			var version  = softwareMatch.VERSION;
			var vendor   = softwareMatch.VENDOR;
			var desc     = softwareMatch.DESC;
			
			var software = {};
			if (!name)
				continue;
			
			software.name = name;
			if (cat)
				software.category = cat;
			
			if (version)
				software.version = version;
			
			if (vendor)
				software.vendor = vendor;
			
			if (desc)
				software.short_description = desc + (pkg_name ? (" ; Pkginst: " + pkg_name + ".") : "");
			
			packages.push(software);
		}
		
		related_data.packages= packages;
		
	},
	
	type: "ProbePostProcessor"
});
