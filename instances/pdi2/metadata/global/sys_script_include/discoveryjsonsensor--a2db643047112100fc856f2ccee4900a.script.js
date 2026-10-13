var DiscoveryJSONSensor = Class.create();

DiscoveryJSONSensor.prototype = Object.extendsObject(DiscoverySensor, {

    process: function(result) {
        // Prepare current and related_data
		this.prepareJSON(result);
		
		// Process the JSON
		this.processJSON();
    },
	
	processJSON: function() {
    },
	
    type: "DiscoverySensor"
});
