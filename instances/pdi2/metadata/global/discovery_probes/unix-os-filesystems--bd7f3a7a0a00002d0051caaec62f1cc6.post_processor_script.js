new ProbePostProcessor({

    /**
     * Runs the probe instance
     */

    process : function() {
		var lines = output.split(/\n/);

		// no results
		if (lines.length == 0)
			return;

		related_data.fileSystems = {};
		for (var i = 0; i < lines.length; i++) {
		    var line = lines[i].trim();
            // handle the case where one of our data lines was split because the name was too long...
            if (line.indexOf(' ') < 0) {
                if ((i + 1 < lines.length) && (lines[i + 1].charAt(0) == ' ')) {
                    i++;
                    line = line + ' ' + lines[i].trim();
                }
            }

		    // neither local nor remote (cifs/nfs)
            if (!line.startsWith('/dev/') && !line.startsWith('//') && line.indexOf(':') === -1)
                continue;

            var parts = line.split(/\s+/);
            related_data.fileSystems[parts[5]] = {};
            related_data.fileSystems[parts[5]].name = parts[0];
            related_data.fileSystems[parts[5]].capacity = Math.round(parseInt(parts[1]) / 1024);
            related_data.fileSystems[parts[5]].available_space = Math.round(parseInt(parts[3]) / 1024);
		}
	},

    type: "ProbePostProcessor"
});
