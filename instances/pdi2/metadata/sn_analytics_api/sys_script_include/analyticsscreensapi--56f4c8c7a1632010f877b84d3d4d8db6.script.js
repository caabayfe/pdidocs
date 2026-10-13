var AnalyticsScreensApi = Class.create();
AnalyticsScreensApi.prototype = {

    initialize: function(appTableName, appRecordId) {
        this.logger = AnalyticsApiLogger.getLogger('AnalyticsScreensApi');
        if (gs.nil(appTableName) || gs.nil(appRecordId)) {
            var errMsg = 'Please provide require params ApplicationTableName and ApplicationRecordSysId';
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        this.config = {
            app_table_name: appTableName,
            app_record_id: appRecordId,
        };
    },

    /**
     * @param - platform
     * @param - screen_type
     */

    getScreens: function(params) {
        this.config.endpoint = "/screens/find";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.SCREEN_TYPE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    type: 'AnalyticsScreensApi'
};
