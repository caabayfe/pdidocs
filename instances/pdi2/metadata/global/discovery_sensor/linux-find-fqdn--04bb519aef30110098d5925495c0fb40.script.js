new DiscoveryJSONSensor({
    
    processJSON: function(jsonResult) {
		// Clean up any nil properties to be safe
		this.removeNilProps();			
    },
	
    type: "DiscoveryJSONSensor"
});
