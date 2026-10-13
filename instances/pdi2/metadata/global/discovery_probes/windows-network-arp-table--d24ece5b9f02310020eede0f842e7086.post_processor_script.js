new ProbePostProcessor({
	process : function() {
		var lines = output.split(/\n/);
		// no results
		if (lines.length == 0)
			return;
		related_data.arpTable = {};
		for (var i=0; i<lines.length; i++) {
			var line = lines[i].trim();
			// ignore header fields
			if (!line.startsWith('Interface') && !line.startsWith('Internet')) {
				var parts                    = line.split(/\s+/);
				related_data.arpTable[i]     = {};
				related_data.arpTable[i].mac = parts[1].replace(/-/g,':').toLowerCase();
				related_data.arpTable[i].ip  = parts[0];
			}
		}
	},
	
	type: "ProbePostProcessor"
});
