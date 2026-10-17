new ProbePostProcessor({
	
	process : function() {
		if (JSUtil.nil(output))
			return;
		
		var lines = output.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			if (line.indexOf("nginx version:") > -1) {
                var version = line.substring(line.indexOf(":") + 2);
				
				if (version.startsWith("nginx/"))
               	 version = version.substring(6);
				
				current.version = version.trim();
				break;
			}	
		}
		
		current.short_description = output; 
	},
	
	type: "ProbePostProcessor"
});
