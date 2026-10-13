function transform() {
	var config = new CAConfig();
    var appTableName = config.getAppTableName();
    var appRecordId = config.getAppRecordSysId();
    var analyticsSettings = sn_app_analytics.SNAnalytics.retrieveSettings(appTableName, appRecordId);
    if (gs.nil(analyticsSettings))
        return {
            error: 'Analytics settings not found for Application, ' + appTableName + ", " + appRecordId
        };
    var apiKey = analyticsSettings.getApiKey();
    return {
        key: apiKey
    };
}
