new DiscoveryJSONSensor({
	
	processJSON: function() {    
		
		if (JSUtil.notNil(current.cpu_speed))
			current.cpu_speed = new RoundingInterval("cpu").getRoundedValue(current.cpu_speed);

		var mm = MakeAndModelJS.fromNames(current.cpu_type, null);
		current.cpu_manufacturer = mm.getManufacturerSysID();
		if (JSUtil.notNil(current.ram))
			current.ram = new RoundingInterval("ram").getRoundedValue(current.ram);

		if (JSUtil.notNil(related_data.module_array))
			this.addToRelatedList('cmdb_ci_memory_module', related_data.module_array, 'cmdb_ci', 'name');
		
		this.removeNilProps(); // to be safe
	},

	type: "DiscoveryJSONSensor"
});
