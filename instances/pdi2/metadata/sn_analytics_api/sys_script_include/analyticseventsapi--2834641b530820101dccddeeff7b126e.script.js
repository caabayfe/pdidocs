var AnalyticsEventsApi = Class.create();
AnalyticsEventsApi.prototype = {

    initialize: function(appTableName, appRecordId) {
        this.logger = AnalyticsApiLogger.getLogger('AnalyticsEventsApi');
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
     */

    getEventTypes: function(params) {
        this.config.endpoint = "/events/metadata/event-types";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - event_type_filter - @optional
     */

    getEventNamesByType: function(params) {
        this.config.endpoint = "/events/metadata/event-names-by-type";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - event_type
     * @param - event_property_name
     */

    getEventNamesByEventPropertyValues: function(params) {
        this.config.endpoint = "/events/metadata/event-names-by-event-property-values";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.EVENT_TYPE.name, AnalyticsAPIMetadata.Params.EVENT_PROPERTY_NAME.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - event_name
     */

    getEventPropertyNames: function(params) {
        this.config.endpoint = "/events/metadata/event-property-names";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.EVENT_NAME.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - event_name
     */

    getEventProperties: function(params) {
        this.config.endpoint = "/events/metadata/event-properties";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.EVENT_NAME.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - event_type
     * @param - event_property_name
     */

    getEventPropertyValuesAcrossType: function(params) {
        this.config.endpoint = "/events/metadata/event-property-values-across-type";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.EVENT_TYPE.name, AnalyticsAPIMetadata.Params.EVENT_PROPERTY_NAME.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*****        Analytics      *****/

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - event_type_filter
     * @param - event_name_filter - @optional
     */

    getAnalyticsTotalEvents: function(params) {
        this.config.endpoint = "/analytics/events/total";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - event_type_filter
     * @param - event_name_filter - @optional
     * @param - date_bucket
     */

    getAnalyticsTotalEventsByDate: function(params) {
        this.config.endpoint = "/analytics/events/total-by-date";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.DATE_BUCKET.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - event_type_filter
     * @param - event_name_filter - @optional
     * @param - property_name_filter - @optional
     * @param - property_value_filter - @optional
     */

    getAnalyticsEventPropertyValues: function(params) {
        this.config.endpoint = "/analytics/events/property-values";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - event_type_filter
     * @param - event_name_filter - @optional
     * @param - property_name_filter - @optional
     * @param - property_value_filter - @optional
     * @param - date_bucket
     */

    getAnalyticsEventPropertyValuesByDate: function(params) {
        this.config.endpoint = "/analytics/events/property-values-by-date";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.DATE_BUCKET.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    type: 'AnalyticsEventsApi'
};
