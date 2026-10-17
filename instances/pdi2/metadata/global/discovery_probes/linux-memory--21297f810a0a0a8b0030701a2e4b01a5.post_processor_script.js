new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
		var lines = output.split("\n");
		
		var ram = 0;
		
		for (var i = 0; i < lines.length; i++) {
			var columns = lines[i].split(/\s+/);
			
            if (columns[0] == "MemTotal:")
                ram += parseInt(columns[1]) / 1024;
		}
		
		if (ram > 0)
			current.ram = ram;		
	},
   
    type: "ProbePostProcessor"
});
