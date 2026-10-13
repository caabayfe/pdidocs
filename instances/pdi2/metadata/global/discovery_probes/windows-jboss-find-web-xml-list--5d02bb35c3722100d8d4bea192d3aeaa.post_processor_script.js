new ProbePostProcessor({

	/**
     * Runs the probe instance
     */
    process : function() {
		related_data.filepaths = [];
		var lines = output.split("\n");

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].trim();
			related_data.filepaths.push(line);
		}
	},

	type: "ProbePostProcessor"
});
