var AnalyticsSessionsApi = Class.create();
AnalyticsSessionsApi.prototype = {

    initialize: function(appTableName, appRecordId) {
        this.logger = AnalyticsApiLogger.getLogger('AnalyticsSessionsApi');
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
     * @param - app_version
     *
     * @payload - sessions
     */

    addSessions: function(params, payload) {
        // Adding /instance prefix
        this.config.endpoint = "/instance/sessions/add";
        // Setting Base URL to the public server host and not the default internal URL since this endpoint is used for sending Analytics data,
		// and data collection from SDKs and VA should be routed to public URL
        this.config.baseURL = sn_app_analytics.SNAnalytics.getAPIServerHost();
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.APP_VERSION.name];
        payload = new AppseeAnalytics(this.config, params).createAddSessionPayload(payload);
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config, payload);
    },

    /**
     * @param - query
     * @param - page_size
     * @param - page_num
     * @param - sort_field
     * @param - sort_direction
     * @param - options - @optional
     */

    findPage: function(params) {
        this.config.endpoint = "/sessions/find-page";
        this.config.required_params = [AnalyticsAPIMetadata.Params.QUERY.name, AnalyticsAPIMetadata.Params.PAGE_SIZE.name, AnalyticsAPIMetadata.Params.PAGE_NUM.name, AnalyticsAPIMetadata.Params.SORT_FIELD.name, AnalyticsAPIMetadata.Params.SORT_DIRECTION.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - query
     * @param - page_size
     * @param - page_num
     * @param - sort_field
     * @param - sort_direction
     */

    getCount: function(params) {
        this.config.endpoint = "/sessions/count";
        this.config.required_params = [AnalyticsAPIMetadata.Params.QUERY.name, AnalyticsAPIMetadata.Params.PAGE_SIZE.name, AnalyticsAPIMetadata.Params.PAGE_NUM.name, AnalyticsAPIMetadata.Params.SORT_FIELD.name, AnalyticsAPIMetadata.Params.SORT_DIRECTION.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - session_id
     * @param - include_deleted - @optional
     */

    getById: function(params) {
        this.config.endpoint = "/sessions/get-by-id";
        this.config.required_params = [AnalyticsAPIMetadata.Params.SESSION_ID.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - session_id
     * @param - user_id
     * @param - is_favorite - {boolean}
     */

    updateIsFavorite: function(params) {
        this.config.endpoint = "/sessions/update-is-favorite";
        this.config.required_params = [AnalyticsAPIMetadata.Params.SESSION_ID.name, AnalyticsAPIMetadata.Params.USER_ID.name, AnalyticsAPIMetadata.Params.IS_FAVORITE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     */

    getDynamicPropertyNames: function(params) {
        this.config.endpoint = "/sessions/metadata/dynamic-property-names";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - property_classifier
     */

    getPropertyUniqueValues: function(params) {
        this.config.endpoint = "/sessions/metadata/property-unique-values";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.PROPERTY_CLASSIFIER.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - dynamic_property_name
     */

    getDynamicPropertyUniqueValues: function(params) {
        this.config.endpoint = "/sessions/metadata/dynamic-property-unique-values";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.DYNAMIC_PROPERTY_NAME.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     */

    getCountries: function(params) {
        this.config.endpoint = "/sessions/location/countries";
        this.config.required_params = [];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     * @param - country
     */

    getRegions: function(params) {
        this.config.endpoint = "/sessions/location/regions";
        this.config.required_params = [AnalyticsAPIMetadata.Params.COUNTRY.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     * @param - country
     * @param - regions - @optional
     */

    getCities: function(params) {
        this.config.endpoint = "/sessions/location/cities";
        this.config.required_params = [AnalyticsAPIMetadata.Params.COUNTRY.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - from_date
     * @param - to_date
     * @param - page_size
     * @param - batch_id - @optional
     */

    exportSessions: function(params) {
        this.config.endpoint = "/sessions/export";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.PAGE_SIZE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*****        Analytics      *****/

    /**
     * @param - platform
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     */

    getAnalyticsTotalSessions: function(params) {
        this.config.endpoint = "/analytics/sessions/total";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - date_bucket
     */

    getAnalyticsTotalSessionsByDate: function(params) {
        this.config.endpoint = "/analytics/sessions/total-by-date";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.DATE_BUCKET.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);

    },

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - property_name_filter - @optional
     */

    getAnalyticsSessionDynamicPropertyValues: function(params) {
        this.config.endpoint = "/analytics/sessions/dynamic-property-values";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - date_bucket
     */

    getAnalyticsSessionAverageDurationByDate: function(params) {
        this.config.endpoint = "/analytics/sessions/avg-duration-by-date";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.DATE_BUCKET.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     */

    getAnalyticsSessionLocale: function(params) {
        this.config.endpoint = "/analytics/sessions/locale";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name, AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**	
     * @param - platform	
     */

    getAnalyticsSessionTranslatedLocale: function(params) {
        this.config.endpoint = "/sessions/metadata/locales-translated";
        this.config.required_params = [AnalyticsAPIMetadata.Params.PLATFORM.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    type: 'AnalyticsSessionsApi'
};
