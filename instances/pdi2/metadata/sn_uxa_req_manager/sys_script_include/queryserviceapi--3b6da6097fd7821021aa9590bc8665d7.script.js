var QueryServiceAPI = Class.create();
QueryServiceAPI.prototype = {
    initialize: function() {
        this.logger = QueryServiceApiLogger.getLogger('QueryServiceAPI');
        this.config = {};
        this.config.stringify_object_params = true;
    },

    /*
     * @param - query
     */
    query: function(params) {
        this.config.endpoint = "/data/query";
        this.config.required_params = [QueryServiceApiMetadata.Params.QUERY.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    funnelQuery: function(params) {
        this.config.endpoint = "/data/funnels/get";
        this.config.required_params = [QueryServiceApiMetadata.Params.QUERY_FILTER.name, QueryServiceApiMetadata.Params.STEPS.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.SAMPLING_LEVEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getSinglePageNavData: function(params) {
        this.config.endpoint = "/data/navigations/get-single-page-navigations";
        this.config.required_params = [QueryServiceApiMetadata.Params.PAGE_NAME.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.NAVIGATION_DIRECTION.name, QueryServiceApiMetadata.Params.TOP_PAGES_THRESHOLD.name, QueryServiceApiMetadata.Params.SAMPLING_LEVEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getSessionDataPoints: function(params) {
        this.config.endpoint = "/data/session-data-points";
        this.config.required_params = [QueryServiceApiMetadata.Params.SESSION_ID.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.INSTANCE_USER_ID.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getUserDetails: function(params) {
        this.config.endpoint = "/data/user-details";
        this.config.required_params = [QueryServiceApiMetadata.Params.INSTANCE_USER_ID.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    //Retention APIs start
    getNeverReturnedCount: function(params) {
        this.config.endpoint = "data/retention/never-returned-count";
        this.config.required_params = [QueryServiceApiMetadata.Params.BUCKET_TYPE.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getReturnedAfterTimeCount: function(params) {
        this.config.endpoint = "data/retention/returned-after-time-count";
        this.config.required_params = [QueryServiceApiMetadata.Params.BUCKET_TYPE.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getSessionFrequency: function(params) {
        this.config.endpoint = "data/retention/session-frequency";
        this.config.required_params = [QueryServiceApiMetadata.Params.BUCKET_TYPE.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getAvgTimeBetweenSessions: function(params) {
        this.config.endpoint = "data/retention/avg-time-between-sessions";
        this.config.required_params = [QueryServiceApiMetadata.Params.BUCKET_TYPE.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name, QueryServiceApiMetadata.Params.FIRST_SESSIONS_RANGE.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },
    //Retention APIs end

    /*
     * @param - event_type
     */
    getEventNamesByType: function(params) {
        this.config.endpoint = "/metadata/get-event-names-by-type";
        this.config.required_params = [QueryServiceApiMetadata.Params.EVENT_TYPE.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getCountries: function(params) {
        this.config.endpoint = "/metadata/get-countries";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        const countryCodes = [];
        // fetch response from the get-countries QueryService API
        const response = new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
        // prepare list of country codes received
        response.forEach(item => {
            if (item?.v)
                countryCodes.push(item.v);
        });
        // call Java function to fetch the cached countries
        const countryWithCode = this.getCountryNames(countryCodes);
        const countries = [];
        for (const [key, value] of Object.entries(countryWithCode)) {
            countries.push({
                k: key,
                v: value
            });
        }
        return this.getObjectsByKeyAndSort(countries, params.searchText, params.sortOrder);
    },

    /**
     * returns array of object [{countryCode,CountryName}]
     */
    getCountryNames: function(countryCodes = []) {
        // call Java function to fetch the cached countries
        const client = new sn_app_analytics.SNAnalyticsQueryService();
        return client.getCountries(countryCodes);
    },

    /*
     * @param - country_code
     * @param - region
     */
    getCities: function(params) {
        this.config.endpoint = "/metadata/get-cities";
        this.config.required_params = [QueryServiceApiMetadata.Params.COUNTRY_CODE.name, QueryServiceApiMetadata.Params.REGION.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*
     * @param - country_code
     */
    getRegions: function(params) {
        this.config.endpoint = "/metadata/get-regions";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name, QueryServiceApiMetadata.Params.COUNTRY_CODE.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*
     * @param: params
     */
    getOsTypes: function(params = {}) {
        const channel = params.channel || '';
        let osTypes = QueryServiceApiMetadata.Params.OS_TYPES.valid_values;
        //perform the existing channel check first
        if (channel == UXAConstants.CHANNEL_ENUM.MOBILE.ID || channel.toUpperCase() == 'MOBILE') {
            osTypes = osTypes.filter(function(item) {
                return item.v.toUpperCase() == 'IOS' || item.v.toUpperCase() == 'ANDROID';
            });
        }

        return this.getObjectsByKeyAndSort(osTypes, params.searchText, params.sortOrder);
    },

    /*
     * @param: params
     */
    getDeviceTypes: function(params = {}) {
        const channel = params.channel || '';
        let deviceTypes = QueryServiceApiMetadata.Params.DEVICE_TYPES.valid_values;
        //perform the existing channel check first
        if (channel == UXAConstants.CHANNEL_ENUM.MOBILE.ID || channel.toUpperCase() == 'MOBILE') {
            deviceTypes = deviceTypes.filter(function(item) {
                return item.v.toUpperCase() != 'DESKTOP';
            });
        }
        return this.getObjectsByKeyAndSort(deviceTypes, params.searchText, params.sortOrder);
    },

    getConnectivities: function(params = {}) {
        const connectivities = QueryServiceApiMetadata.Params.CONNECTIVITIES.valid_values;
        return this.getObjectsByKeyAndSort(connectivities, params.searchText, params.sortOrder);
    },

    getBrowserTypes: function(params = {}) {
        const browserTypes = QueryServiceApiMetadata.Params.BROWSER_TYPES.valid_values;
        return this.getObjectsByKeyAndSort(browserTypes, params.searchText, params.sortOrder);
    },

    getAppChannelTypes: function(params = {}) {
        const channels = new UXAApplicationUtils().getChannels(params);
        const channelArr = [];
        Object.entries(channels).forEach(([key, {
            id,
            value
        }]) => {
            channelArr.push({
                k: id,
                v: value
            });
        });
        return channelArr;
    },

    getUserTypes: function(params = {}) {
        const userTypes = QueryServiceApiMetadata.Params.USER_TYPES.valid_values;
        return this.getObjectsByKeyAndSort(userTypes, params.searchText, params.sortOrder);
    },

    getApplications: function(params = {}) {
        const utils = new UXAApplicationUtils();
        const applicationObjList = utils.getAllAppsForUser(params);
        const applications = [];

        if (applicationObjList?.length) {
            applicationObjList.forEach(element => {
                const application = {
                    'k': element.AppSysId,
                    'v': element.AppName
                };
                applications.push(application);
            });
        }
        return applications;
    },

    /*
     * @param - browser types
     */
    getBrowserVersions: function(params) {
        this.config.endpoint = "/metadata/get-browser-versions";
        this.config.required_params = [QueryServiceApiMetadata.Params.BROWSER_TYPES.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getLocales: function(params) {
        this.config.endpoint = "/metadata/get-locales";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        if (params?.searchText)
            params.contains = params.searchText;
        const locales = new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
        return this.getObjectsByKeyAndSortArray(locales, params.searchText, params.sortOrder);
    },

    getLanguages: function(params) {
        this.config.endpoint = "/metadata/get-languages";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.OS.name, QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getAppVersions: function(params) {
        this.config.endpoint = "/metadata/get-app-versions";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.OS.name, QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        const appVersions = new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
        return this.getObjectsByKeyAndSortArray(appVersions, params.searchText, params.sortOrder);
    },

    getPageNames: function(params, searchTerm) {
        this.config.endpoint = "/metadata/get-page-names";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name, QueryServiceApiMetadata.Params.PAGE_NAMES.name];
        let response = new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);

        // get updated page names
        // If searchTerm is there, then only return those pages, which starts with searchTerm
        const updatedResponse = [];
        if (params.app_sys_id) {
            const result = new UXAPageUtils().fetchInstancePageNames(params.app_sys_id);
            if (!(result.status && result.status == UXAConstants.NO_RESULTS)) {
                response.forEach(item => {
                    item.v = result[item.k] || item.v;
                    updatedResponse.push(item);
                });
            }
        }
        if (updatedResponse?.length)
            response = updatedResponse;

        searchTerm = searchTerm || params.searchText;
        return this.getObjectsByKeyAndSort(response, searchTerm, params.sortOrder);
    },

    getEventNames: function(params) {
        this.config.endpoint = "/metadata/get-event-names";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*
     * @param - eventName
     */
    getEventPropertyNames: function(params) {
        this.config.endpoint = "/metadata/get-event-property-names";
        this.config.required_params = [QueryServiceApiMetadata.Params.EVENT_NAME.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*
     * @param - eventName
     * @param - eventPropertyType
     */
    getEventPropertyValues: function(params) {
        this.config.endpoint = "/metadata/get-event-property-values";
        this.config.required_params = [
            QueryServiceApiMetadata.Params.EVENT_NAME.name,
            QueryServiceApiMetadata.Params.EventPropertyType.name,
            QueryServiceApiMetadata.Params.EventPropertyName.name
        ];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        if (params?.searchText)
            params.contains = params.searchText;
        const eventPropertyValues = new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
        return this.getObjectsByKeyAndSortArray(eventPropertyValues, params.searchText, params.sortOrder);
    },

    /*
     */
    getEventPropertiesIndicationData: function(params) {
        this.config.endpoint = "/metadata/get-events-properties-indication";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getDevices: function(params) {
        this.config.endpoint = "/metadata/get-devices";
        this.config.required_params = [];
        this.config.optional_params = [QueryServiceApiMetadata.Params.OS.name, QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    /*
     * @param - osTypes
     */
    getOsVersions: function(params) {
        this.config.endpoint = "/metadata/get-os-versions";
        this.config.required_params = [QueryServiceApiMetadata.Params.OS_TYPES.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.START_DATE.name, QueryServiceApiMetadata.Params.END_DATE.name, QueryServiceApiMetadata.Params.CONTAINS.name, QueryServiceApiMetadata.Params.LIMIT.name, QueryServiceApiMetadata.Params.SORT_BY_NAME.name, QueryServiceApiMetadata.Params.SORT_DIRECTION.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getERD: function(params) {
        this.config.endpoint = "/metadata/get-erd";
        this.config.required_params = [];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getRetentionCohort(params) {
        this.config.endpoint = "/data/cohorts/get-retention-cohort";
        this.config.required_params = [QueryServiceApiMetadata.Params.BUCKET_TYPE.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.SAMPLING_LEVEL.name, QueryServiceApiMetadata.Params.TIMEZONE.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getCohort(params) {
        this.config.endpoint = "/data/cohorts/get";
        this.config.required_params = [QueryServiceApiMetadata.Params.BUCKET_TYPE.name, QueryServiceApiMetadata.Params.QUERY_FILTER.name, QueryServiceApiMetadata.Params.STEPS.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.APP_SYS_ID.name, QueryServiceApiMetadata.Params.CHANNEL.name, QueryServiceApiMetadata.Params.SAMPLING_LEVEL.name, QueryServiceApiMetadata.Params.TIMEZONE.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getNavigationPaths(params) {
        this.config.endpoint = "/data/navigations/get-navigation-paths";
        this.config.required_params = [QueryServiceApiMetadata.Params.QUERY_FILTER.name];
        this.config.optional_params = [QueryServiceApiMetadata.Params.PAGE_NAME.name, QueryServiceApiMetadata.Params.SAMPLING_LEVEL.name];
        return new QueryServiceApiUtils(this.logger).getApiResponse(params, this.config);
    },

    getCustomUserProperties(params = {}) {
        const filterProcessor = new sn_uxa_commons.UXAPageFilterProcessor();
        const customProperties = filterProcessor.getUserPropertyFilters(new Map(), params.fromSysUsersTableOnly);
        return customProperties.map(filter => {
            const {
                filter_id,
                label,
                payload
            } = filter;
            return {
                k: filter_id,
                v: label,
                metadata: {
                    table: payload.table,
                    field: payload.field,
                    internalType: payload.internalType
                }
            };
        });
    },

    /*
	* @param - jsonArray of objects which are in the format
	[{
    'k': 0,
    'v': 'iOS'
	}]
	* @param - searchText
	* @param - sortOrder ASC|DESC
	*/
    getObjectsByKeyAndSort: function(jsonArray, searchText, sortOrder) {
        if (!jsonArray?.length)
            return jsonArray;

        let values = jsonArray;
        //First search the value if params has object with v containing searchText
        if (searchText)
            values = values.filter(item => item.v.toLowerCase().includes(searchText.toLowerCase()));

        if (!sortOrder)
            sortOrder = 'ASC';

        //Filter the values
        values = values.filter(value =>
            value &&
            typeof value.v === 'string' &&
            value.v !== '' &&
            value.k !== ''
        );

        // Sort the filtered array based on the value field and sortOrder (ASC or DESC)
        return values.sort((a, b) => {
            if (typeof a.v === "string" && typeof b.v === "string") {
                // Compare string values
                return sortOrder === "ASC" ?
                    a.v.localeCompare(b.v) :
                    b.v.localeCompare(a.v);
            }
        });
    },

    getObjectsByKeyAndSortArray: function(arr, searchText, sortOrder) {
        if (!arr?.length)
            return arr;

        let values = arr;
        //First search the value if array contains searchText
        if (searchText)
            values = values.filter(item => item.includes(searchText));

        if (!sortOrder)
            sortOrder = 'ASC';

        // Sort the filtered array based sortOrder (ASC or DESC)
        return values.sort((a, b) => {
            if (typeof a === "string" && typeof b === "string") {
                // Compare string values
                return sortOrder === "ASC" ?
                    a.localeCompare(b) :
                    b.localeCompare(a);
            }
        });
    },

    type: 'QueryServiceAPI'
};
