new DiscoveryJSONSensor({
    
	processJSON: function() {					
		var cpu_speed = current.cpu_speed;
		if (JSUtil.notNil(cpu_speed)) {
			cpu_speed = new RoundingInterval("cpu").getRoundedValue(parseInt(cpu_speed));
		
			if (cpu_speed != Number.NaN)
				current.cpu_speed = cpu_speed;
		}
		
		var cpu_vendor = current.cpu_vendor;
		if (JSUtil.notNil(cpu_vendor)) {
			var mm = MakeAndModelJS.fromNames(cpu_vendor, null);
			current.cpu_manufacturer = mm.getManufacturerSysID();
			
			// use the vendor as the cpu type because /proc/cpuinfo does not have cpu_type info
			current.cpu_type = cpu_vendor;
		}
				
		/* 
		 * If this is a VM and we were unable to obtain physical_id info then
		 * set CPU count to 1 and core count equal to the number of processors.
		 * The assumption here is that a VCPU is equivalent to a core and virtual machines do not
		 * have multiple processors.
		 */
		var ci = g_sensor.getCmdbRecord();
		if (ci && ci.virtual == "1" && !JSUtil.toBoolean(related_data.hasPhysicalId)) {
			current.cpu_core_count = current.cpu_count;
			current.cpu_count = 1;
		}

		// Clean up any nil properties to be safe
		this.removeNilProps();		
    },

    type: "DiscoveryJSONSensor"
});
