new DiscoverySensor({
	process: function(result) {
		this.debug("In TraceRouteSensor");
		var resultHandler = new SNC.TraceRouteResultHandler();
		resultHandler.handleResult(g_probe);
	},
	
	type: "DiscoverySensor"
});
