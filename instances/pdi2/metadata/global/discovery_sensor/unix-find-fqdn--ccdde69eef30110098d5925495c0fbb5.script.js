new DiscoveryJSONSensor({
    
    processJSON: function() {
		this.removeNilProps();
    },
	
    type: "DiscoveryJSONSensor"
});
