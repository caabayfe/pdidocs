new ProbePostProcessor({
	
    /**
     * Runs the probe instance 
     */
	process : function() {
		var lines = output.split(/\n/);
		
		var ram = 0;
		
		for (var i = 0; i < lines.length; i++) {
			var parts = lines[i].split(":");
			
			if (JSUtil.notNil(parts[0]) && (parts[0] == "Memory size")) {
				if (JSUtil.notNil(parts[1])){
					var rest = parts[1].trim().split(" ");
					ram = rest[0];
					if (ram > 0)
						current.ram = ram;
				}
			}
		}
	},
	
	type: "ProbePostProcessor"
});
