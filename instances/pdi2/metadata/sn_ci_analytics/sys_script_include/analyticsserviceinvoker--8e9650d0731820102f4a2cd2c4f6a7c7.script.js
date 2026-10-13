var AnalyticsServiceInvoker = {

    /**
     * @param {string} serviceType - Type of service which is invoked
     * @param {string} serviceName - Name of service which is invoked
     * @param {Object} serviceParams - The required parameters of service
     * @returns {Object} Result of service invocation
     */
    invoke: function(serviceType, serviceName, serviceParams) {

        var serviceObject = this.getService(serviceType);
        if (serviceObject && serviceObject[serviceName]) {
            var serviceApi = serviceObject[serviceName];
            try {
                var response = JSON.parse(serviceApi.call(serviceObject, this.prepareParams(serviceParams)));
                return response;
            } catch (e) {
                gs.error("Error while calling AnalyticsService: " + e);
                throw e;
            }
        }

        gs.info("Service Name " + serviceName + " does not exist inside " + serviceType + " type AnalyticsService.");

    },

    /**
     * @param {string} serviceType - Type of service i.e. Session, Event or User
     * @returns {Object} Service object which is used to invoke a service api
     */
    getService: function(serviceType) {
        var config = new CAConfig();
        var appTableName = config.getAppTableName();
        var appRecordId = config.getAppRecordSysId();
        var service = null;
        switch (serviceType) {
            case 'Session':
                service = new sn_analytics_api.AnalyticsSessionsApi(appTableName, appRecordId);
                break;
            case 'Event':
                service = new sn_analytics_api.AnalyticsEventsApi(appTableName, appRecordId);
                break;
            case 'User':
                service = new sn_analytics_api.AnalyticsUsersApi(appTableName, appRecordId);
                break;
            case 'Funnel':
                service = new sn_analytics_api.AnalyticsFunnelsApi(appTableName, appRecordId);
                break;
            case 'Screen':
                service = new sn_analytics_api.AnalyticsScreensApi(appTableName, appRecordId);
                break;
            default:
                throw new Error("Service type " + serviceType + " not identified in AnalyticsService");
        }
        return service;
    },

    /**
     * @param {Object} inputParams - The required parameters of service
     * @returns {Object} Service parameters
     */
    prepareParams: function(inputParams) {
        var paramsBuilder = sn_analytics_api.ParamsBuilder.addParams();
        paramsBuilder.withPlatform(this.getPlatform());
        for (var key in inputParams) {
            var param = inputParams[key];
            switch (key) {
                case 'from_date':
                    paramsBuilder.withFromDate(param);
                    break;
                case 'to_date':
                    paramsBuilder.withToDate(param);
                    break;
                case 'property_classifier':
                    paramsBuilder.withPropertyClassifier(param);
                    break;
                case 'date_bucket':
                    paramsBuilder.withDateBucket(param);
                    break;
                case 'event_type':
                    paramsBuilder.withEventType(param);
                    break;
                case 'event_type_filter':
                    paramsBuilder.withEventTypeFilter(param);
                    break;
                case 'event_name_filter':
                    paramsBuilder.withEventNameFilter(param);
                    break;
                case 'event_property_name':
                    paramsBuilder.withEventPropertyName(param);
                    break;
                case 'property_name':
                    paramsBuilder.withPropertyName(param);
                    break;
                case 'property_name_filter':
                    paramsBuilder.withPropertyNameFilter(param);
                    break;
                case 'property_value_filter':
                    paramsBuilder.withPropertyValueFilter(param);
                    break;
                case 'query':
                    paramsBuilder.withQuery(param);
                    break;
                case 'page_size':
                    paramsBuilder.withPageSize(param);
                    break;
                case 'page_num':
                    paramsBuilder.withPageNum(param);
                    break;
                case 'sort_field':
                    paramsBuilder.withSortField(param);
                    break;
                case 'sort_direction':
                    paramsBuilder.withSortDirection(param);
                    break;
                case 'user_id':
                    paramsBuilder.withUserId(param);
                    break;
                case 'include_deleted':
                    paramsBuilder.withIncludeDeleted(param);
                    break;
                case 'session_id':
                    paramsBuilder.withSessionId(param);
                    break;
                case 'is_favorite':
                    paramsBuilder.withIsFavorite(param);
                    break;
                case 'funnel_id':
                    paramsBuilder.withFunnelId(param);
                    break;
                case 'dynamic_property_name':
                    paramsBuilder.withDynamicPropertyName(param);
                    break;
                case 'screen_type':
                    paramsBuilder.withScreenType(param);
                    break;
                case 'event_name':
                    paramsBuilder.withEventName(param);
                    break;
                case 'funnel_id':
                    paramsBuilder.withFunnelId(param);
                    break;
                case 'funnel_name':
                    paramsBuilder.withFunnelName(param);
                    break;
                case 'date_interval':
                    paramsBuilder.withDateInterval(param);
                    break;
                case 'steps':
                    paramsBuilder.withSteps(param);
                    break;
                case 'allow_statistical':
                    paramsBuilder.withAllowStatistical(param);
                    break;
            }
        }

        var params = paramsBuilder.build();
        return params;

    },

    getPlatform: function() {
        return 'chat';
    }

};
