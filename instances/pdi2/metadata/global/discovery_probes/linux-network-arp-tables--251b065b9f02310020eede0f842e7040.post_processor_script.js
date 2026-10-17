new ProbePostProcessor({
	
	process : function() {
		if (JSUtil.nil(output))
			return;
		
		var sliceIndex = output.indexOf('\n');
		if (sliceIndex === -1) {
			g_probe.setError('Unexpected output: ' + output);
			return;
		}
		
		var commandOutput = output.slice(sliceIndex + 1);
		if (output.startsWith('iproute output'))
			this.processIprouteOutput(commandOutput);
		else if (output.startsWith('net-tools output'))
			this.processNetToolsOutput(commandOutput);
		else
			g_probe.setError('Both net-tools and iproute commands failed to get ARP table information');
		
	},
	
	processIprouteOutput: function(iprouteOutput) {
		var regex = new RegExp("^(\\S+).*lladdr\\s+(\\S+)", "gm");
		related_data.arpTable = {};
		var i = 1;
		var parts;
		while((parts = regex.exec(iprouteOutput)) !== null) {
			related_data.arpTable[i]     = {};
			related_data.arpTable[i].mac = parts[2];
			related_data.arpTable[i].ip  = parts[1];
			i++;
		}
	},
	
	processNetToolsOutput: function(netToolsOutput) {
		var lines = netToolsOutput.split(/\n/);
		// no results
		if (lines.length == 0)
			return;
		related_data.arpTable = {};
		for (var i=0; i<lines.length; i++) {
			var line = lines[i].trim();
			// ignore header fields
			if (!line.startsWith('Address')) {
				var parts                    = line.split(/\s+/);
				related_data.arpTable[i]     = {};
				related_data.arpTable[i].mac = parts[2];
				related_data.arpTable[i].ip  = parts[0];
			}
		}
	},
	
	type: "ProbePostProcessor"
});
