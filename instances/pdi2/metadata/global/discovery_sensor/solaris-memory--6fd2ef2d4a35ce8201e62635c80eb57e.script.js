new DiscoveryJSONSensor({
	
	processJSON: function(jsonResult) { 				
		if (JSUtil.notNil(current.ram))
			current.ram = new RoundingInterval("ram").getRoundedValue(current.ram);
		else
			delete current.ram; // to be safe
	},
	
	type: "DiscoveryJSONSensor"
});
