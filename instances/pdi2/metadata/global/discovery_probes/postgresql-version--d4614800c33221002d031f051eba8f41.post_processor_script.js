new ProbePostProcessor({
	
	process : function() {
		if (JSUtil.nil(output))
			return;
		
		var lines = output.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			// expected: postgres (PostgreSQL) 8.4.20
			var tokens = line.split(" ");
			
			if (tokens && tokens.length == 3 && tokens[2])
				current.version = tokens[2];
		}
	},
	
	type: "ProbePostProcessor"
});
