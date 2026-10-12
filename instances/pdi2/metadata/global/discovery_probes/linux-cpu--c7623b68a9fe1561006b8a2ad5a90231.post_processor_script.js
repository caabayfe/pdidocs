new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
		var lines = output.split("\n");
		
		// no results
		if (lines.length == 0)
			return;
		
		var processors = 0;
        var physicalIds = {}; // Keep track of physical ids for an accurate count of CPUs
        physicalIds.count = 0;
        var coreIds = {}; // Keep track of core ids for an accurate count cores
        coreIds.count = 0;
		var cpu_cores = 0;
		var physical_id_in_curr_block = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line == '') 
                continue;

            var parts = line.split(":");
			
			if (parts.length < 2)
				continue;
			
            var name = parts[0].trim();
            var value = parts[1].trim();

			if (name == "processor")
				processors++;				
            else if (name == "cpu MHz") {
            	var cpu_speed = parseInt(value);
                current.cpu_speed = (cpu_speed != Number.NaN ? cpu_speed : "");
            } else if (name == "physical id") {
				physical_id_in_curr_block = value;
				if (!physicalIds[value]) {
               		physicalIds[value] = true;
                	physicalIds.count++;
                }
            } else if (name == "core id" && !coreIds[physical_id_in_curr_block + '.' + value]) {
                coreIds[physical_id_in_curr_block + '.' + value] = true;
                coreIds.count++;
            } else if (name == "cpu cores")
				cpu_cores = parseInt(value);
            else if (name == "model name")
				current.cpu_name = value;
            else if (name == "vendor_id")
                current.cpu_vendor = value;
        }

		/**********************************************************
		Here are the assumptions how we're going to calculate CPU counts, core count and Hyperthreading...
		* Total number of "processor" is the multiplication of number of unique "cpu cores" and 
		  of number of unique "physic" processors (based on physical_id)
		* Each "physical id" represents an actual CPU
		* Each "physical id" + "core id" combination is considered a unique cpu core
		* CPU core count is the number of cores per processor
		* If we get "cpu cores" then we use that instead as the number of cpu cores per processor
		* if total number of "processors" is twice the number of "cpu cores" times "physical processors", 
		  then hyperthreading is enabled.

		Odd cases
		* If number of unique "core id" exceeds the number of "cpu_core", use the number of "core id" 
		* divided by the number of processors to get core count per processor
		* For VMs, it doesn't have "physical id", "core id" or "core count". Its CPU count is based on number of processors
		*******************************************************/
		
		if (processors == 0) {
			// something's wrong here 'cause we didn't see a single procesor header! 
			return;
		}
		
		// Calculate CPU count
		var cpuCount = 1;
		if (physicalIds.count > 0) {
			cpuCount = physicalIds.count;
			related_data.hasPhysicalId = true;
		} else
			cpuCount = processors;
		
		current.cpu_count = cpuCount;
		
		// Calculate CPU core count
		var cpuCoreCount = 1;
		if (coreIds.count > 0 || cpu_cores > 0) {
			if (cpu_cores > coreIds.count) 
				cpuCoreCount = cpu_cores;
			else 
				cpuCoreCount = coreIds.count / cpuCount;			
		}
		current.cpu_core_count = cpuCoreCount;
		
		// Determine hyperthreading. Theoretically, the number of processors should be exactly twice as many cpu * core/cpu.
		// But just in case there's some math error. We're manually setting this to 2 or 1
		if (processors > cpuCount * cpuCoreCount)
			current.cpu_core_thread = 2;
		else
			current.cpu_core_thread = 1;
	},
   
    type: "ProbePostProcessor"
});
