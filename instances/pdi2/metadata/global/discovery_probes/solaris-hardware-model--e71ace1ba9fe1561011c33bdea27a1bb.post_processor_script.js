new ProbePostProcessor({
	
    /**
     * Runs the probe instance
     */
	process : function() {
		var lines = output.split(/\n/);
		
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			if (line == '')
				continue;
			
			var parts = line.split(":");
			var name = parts[0].trim();
			var value = parts[1].trim();
			
			if (JSUtil.notNil(name)){
				if (name == "Model")
					current.model_number = value;
				else if (name == "Description") {
					var extraLen = value.indexOf('(');
					if (extraLen > -1)
						value = value.substring(0, extraLen);
					current.model_id = value.trim();
				} else if (name == "System Configuration") {
					valparts = value.split("  ");
					mfr = valparts[0];
					current.manufacturer = mfr;
				}
			}
		}
	},
	
	type: "ProbePostProcessor"
});
