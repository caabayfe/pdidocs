function transform(input) {
    var metrics = input.metrics;
	var perfService = new CMDBPerfLogService();
    try {
        if (!metrics) {
            perfService.logErrorMessage("Supplied input metrics are missing.");
        } else {
            //Create log Entry
            perfService.createSplunkLogEntry(metrics, perfService.APP_NAME.UNIFIED_MAP_KEY);
            perfService.insertIntoUMPerfTable(metrics);
        }
    } catch (error) {
        perfService.logErrorMessage(perfService.APP_NAME.UNIFIED_MAP, "Error capturing performance metrics. " + error.toString());
    }

}
