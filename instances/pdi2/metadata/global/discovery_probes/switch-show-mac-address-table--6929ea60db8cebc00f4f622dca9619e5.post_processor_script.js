new ProbePostProcessor({
	process : function() {
		var lines = output.split('\n');

		// no results
		if (lines.length == 0)
			return;
		related_data.macTable = [];

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].trim();

			// ignore header fields
			if (!line.startsWith('Legend') && !line.startsWith('* - primary') && !line.startsWith('age') && !line.startsWith('VLAN') && !line.startsWith('----') && !line.startsWith('(T)') && !line.startsWith('Total') && !line.startsWith('(Shell') && (line.toLowerCase().indexOf('error') == -1)) {
				var parts = line.split(/\s+/);
				var forwardingTableObject = {};

				forwardingTableObject.mac_address = parts[1].replace(/\./g,'');
				forwardingTableObject.port = parts[4];
				forwardingTableObject.status = parts[2];
				forwardingTableObject.vlan_id = parts[0];

				related_data.macTable.push(forwardingTableObject);
			}
		}
	},

	type: "ProbePostProcessor"
});
