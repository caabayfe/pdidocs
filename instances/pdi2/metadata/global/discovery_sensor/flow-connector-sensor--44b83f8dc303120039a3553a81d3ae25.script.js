new DiscoverySensor({
	process: function(result) {
		gs.log('Flow Connector Sensor here');
		if (gs.nil(result.output))
			return;
		var resultHandler = new SNC.FlowResultHandler();
		resultHandler.handleResult(result.output);
	},
	
	type: "DiscoverySensor"
});
