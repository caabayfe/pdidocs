new DiscoveryJSONSensor({
	processJSON: function(jsonResult) {
		this.removeNilProps(); // to be safe
	},
	
	type: "DiscoveryJSONSensor"
});
