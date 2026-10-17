new DiscoveryJSONSensor({
	
	processJSON: function(jsonResult) {        
		this.removeNilProps();
    },
   
    type: "DiscoveryJSONSensor"
});
