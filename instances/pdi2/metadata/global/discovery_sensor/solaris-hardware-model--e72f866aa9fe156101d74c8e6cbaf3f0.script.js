new DiscoveryJSONSensor({
	
	processJSON: function(jsonResult) {		
		var mm = MakeAndModelJS.fromNames(current.manufacturer, current.model_id, "hardware");
		current.model_id = mm.getModelNameSysID();
		current.manufacturer = mm.getManufacturerSysID();
		
		this.removeNilProps(); // to be safe
	},
	
	type: "DiscoveryJSONSensor"
});
