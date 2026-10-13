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
		}
		
		this.removeNilProps(); // to be safe
    },

    type: "DiscoveryJSONSensor"
});
