new ProbePostProcessor({
	
	/**
     * Runs the probe instance
     */
	process : function() {
		
        var serials = [];
        var lines = output.split('\n');
        for (var i=0; i<lines.length; i++) {
            var line = lines[i];
            var m = line.match(/^"(.+?)".*"(.+?)"$/);
            if (!m)
                continue;
               
            var serial = {};

            serial.type = m[1];
            serial.value = m[2];
            
            serials.push(serial);
        }

		related_data.serials = serials;

	},
	
	type: "ProbePostProcessor"
});
