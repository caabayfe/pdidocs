new ProbePostProcessor({
	
	/**
     * Runs the probe instance
     */
	process : function() {
		var patches = [];
		
        var lines = output.split(/\n/);
        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(" ");
            if (parts[0] && parts[0] == "Patch:" && parts[1]) {
                	var patchName = parts[1];
                	var patch = {};
                	patch.name = patchName;
                	patches.push(patch);
            }
        }
		
		related_data.patches = patches;
	},
	
	type: "ProbePostProcessor"
});
