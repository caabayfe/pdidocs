var AnalyticsUsersApi = Class.create();
AnalyticsUsersApi.prototype = {

    initialize: function(appTableName, appRecordId) {
        this.logger = AnalyticsApiLogger.getLogger('AnalyticsUsersApi');
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
     * @param - query
     * @param - page_size
     * @param - page_num
     * @param - sort_field
     * @param - sort_direction
     */

    findPage: function(params) {
        this.config.endpoint = "/users/find-page";
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
        this.config.endpoint = "/users/count";
        this.config.required_params = [AnalyticsAPIMetadata.Params.QUERY.name, AnalyticsAPIMetadata.Params.PAGE_SIZE.name, AnalyticsAPIMetadata.Params.PAGE_NUM.name, AnalyticsAPIMetadata.Params.SORT_FIELD.name, AnalyticsAPIMetadata.Params.SORT_DIRECTION.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - user_id
     * @param - include_deleted - @optional
     */

    getById: function(params) {
        this.config.endpoint = "/users/get-by-id";
        this.config.required_params = [AnalyticsAPIMetadata.Params.USER_ID.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - user_id
     * @param - is_favorite - {boolean}
     */

    updateIsFavorite: function(params) {
        this.config.endpoint = "/users/update-is-favorite";
        this.config.required_params = [AnalyticsAPIMetadata.Params.USER_ID.name, AnalyticsAPIMetadata.Params.IS_FAVORITE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     *  no params
     */

    getUserPropertyNames: function(params) {
        this.config.endpoint = "/users/metadata/property-names";
        this.config.required_params = [];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     *  no params
     */

    getUserProperties: function(params) {
        this.config.endpoint = "/users/metadata/properties";
        this.config.required_params = [];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     *  no params
     */

    getUserTags: function(params) {
        this.config.endpoint = "/users/metadata/tags";
        this.config.required_params = [];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*****        Analytics      *****/

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     */

    getAnalyticsTotalUsers: function(params) {
        this.config.endpoint = "/analytics/users/total";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - platform - @optional
     * @param - from_date
     * @param - to_date
     * @param - app_version - @optional
     * @param - date_bucket
     */

    getAnalyticsTotalUsersByDate: function(params) {
        this.config.endpoint = "/analytics/users/total-by-date";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name, AnalyticsAPIMetadata.Params.DATE_BUCKET.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /**
     * @param - from_date
     * @param - to_date
     */

    getAnalyticsTotalNewUsers: function(params) {
        this.config.endpoint = "/analytics/users/new";
        this.config.required_params = [AnalyticsAPIMetadata.Params.FROM_DATE.name, AnalyticsAPIMetadata.Params.TO_DATE.name];
        return new AnalyticsApiUtils(this.logger).getApiResponse(params, this.config);
    },

    type: 'AnalyticsUsersApi'
};
