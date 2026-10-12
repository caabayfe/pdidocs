new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
		var lines = output.split("\n");
		
		var processors = 0;   // Keep track of total virtual CPUs seen by the OS
        var physicalIds = {}; // Keep track of physical ids for an accurate count of CPUs
        physicalIds.count = 0;
        var coreIds = {}; // Keep track of core ids for an accurate count cores
        coreIds.count = 0;
		var physical_id_in_curr_block = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
			
			line = line.trim();
			
            if (line == '') 
                continue;
			
			if (line.indexOf("module:") > -1) {
				processors++;
				continue;
			}
			
			if (line.indexOf("name:") > -1)
				continue;

			var parts = new RegExp("^(.+?)\\s+(.*)$").exec(line);
			
			if (parts.length < 3)
				continue;
			
            var name = parts[1].trim();
            var value = parts[2].trim();

            if (name == "clock_MHz") {
                var cpu_speed = parseInt(value);
				
				if (!isNaN(cpu_speed))
                	current.cpu_speed = cpu_speed;
            } else if (name == "chip_id") {
				physical_id_in_curr_block = value;
				if (!physicalIds[value]) {
                	physicalIds[value] = true;
                	physicalIds.count++;
                }
            } else if (name == "core_id" && !coreIds[physical_id_in_curr_block + '.' + value]) {
                coreIds[physical_id_in_curr_block + '.' + value] = true;
                coreIds.count++;
            } else if (name == "brand")
				current.cpu_name = value;
            else if (name == "cpu_type")
                current.cpu_type = value;
            else if (name == "vendor_id")
				current.cpu_vendor = value;	
			
        }
		
		/**********************************************************
		Here are the assumptions how we're going to calculate CPU counts, core count, threads per core Hyperthreading...
		* Total number of processors represents the total CPUs available to the OS
		* Here's the formula how the various numbers fit into each other
  		Processors = Physical CPUs * Cores per CPU * Threads per core;
		* To get the number of physical CPUs, we need the unique "chip_id" value
		* To get the "total" number of core counts, we count the number of unique "chip_id" + "core_id" combinations
		* To get "core count PER CPU", we just need to divide total "core count" by physical CPUs.
		  This is where kstat differs from cpuinfo in linux. In linux, the unique "core id" already represents
		  core count per CPU, but here we need to do the division to get it.
		* To get the "threads per core", we need to divide total CPU by total core count (processors/toal_core_count)
		*******************************************************/
		
		if (processors == 0) {
			// something's wrong here 'cause we didn't see a single procesor header! 
			return;
		}
		
		// Calculate CPU count
		var cpuCount = 1;
		if (physicalIds.count > 0)
			cpuCount = physicalIds.count;
		
		current.cpu_count = cpuCount;
		
		// Calculate total CPU core count
		var cpuCoreCount = 1;
		if (coreIds.count > 0)
			cpuCoreCount = coreIds.count;			

		// To get core count per CPU, if core_id is not available, then just set the core count to 1.
		current.cpu_core_count = cpuCoreCount == 1 ? cpuCoreCount : cpuCoreCount/cpuCount; 

		// calculate threads per core
		var threadsPerCore = processors/cpuCoreCount;
		current.cpu_core_thread = threadsPerCore;
    },
   
    type: "ProbePostProcessor"
});
