var AnalyticsFunnelsApi = Class.create();
AnalyticsFunnelsApi.prototype = {

    initialize: function(appTableName, appRecordId) {
        if (gs.nil(appTableName) || gs.nil(appRecordId))
            throw 'Please provide require params ApplicationTableName and ApplicationRecordSysId';

        this.config = {
            app_table_name: appTableName,
            app_record_id: appRecordId,
        };
    },

    getAllFunnels: function() {
        this.config.endpoint = "/funnels/all";
        this.config.required_params = [];
        return new AppseeAnalytics(this.config, {}).postRequest();
    },

    /**
     * @param - from_date
     * @param - to_date
     * @param - funnel_id
     */
    getSingleFunnel: function(params) {
        this.config.endpoint = "/funnels/single";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.FUNNEL_ID.name];

        return new AppseeAnalytics(this.config, params).postRequest();
    },

    /**
     * @param - funnel_id
     */
    removeFunnel: function(params) {
        this.config.endpoint = "/funnels/remove";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FUNNEL_ID.name];

        return new AppseeAnalytics(this.config, params).postRequest();
    },

    /**
     * @param - funnel_name
     * @param - platform
     * @param - steps
     * @param - date_interval
     * Returns a new funnel ID for the new funnel if it was created successfully
     */
    createFunnel: function(params) {
        this.config.endpoint = "/funnels/create";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FUNNEL_NAME.name, AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.STEPS.name, AnalyticsAPIMetadata.Params.DATE_INTERVAL.name];

        return new AppseeAnalytics(this.config, params).postRequest();
    },

    /**
     * @param - funnel_id
     * @param - funnel_name
     * @param - platform
     * @param - steps - @optional
     * @param - date_interval
     * Returns a new funnel ID if the steps value is changed. Update the existing funnel for NAME and DATE_INTERVAL change
     */
    updateFunnel: function(params) {
        this.config.endpoint = "/funnels/update";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FUNNEL_ID.name, AnalyticsAPIMetadata.Params.FUNNEL_NAME.name, AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.STEPS.name, AnalyticsAPIMetadata.Params.DATE_INTERVAL.name];

        return new AppseeAnalytics(this.config, params).postRequest();
    },

    type: 'AnalyticsFunnelsApi'
};
