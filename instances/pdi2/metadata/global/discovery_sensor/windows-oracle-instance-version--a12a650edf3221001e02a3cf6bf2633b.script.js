new DiscoveryJSONSensor({
	processJSON: function() {
		this.removeNilProps(); // to be safe
	},
	type: "DiscoveryJSONSensor"
});
