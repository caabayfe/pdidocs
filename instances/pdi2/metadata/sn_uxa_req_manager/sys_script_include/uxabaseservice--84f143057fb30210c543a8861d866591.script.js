var UXABaseService = Class.create();
UXABaseService.prototype = {
    initialize: function(uxaDTO) {
        this.dataConnector = new UXADataConnector(uxaDTO).getConnector();
        this.dslService = new UXADSLService();
        this.baseTransformer = new UXATransformer();
    },

    getData: function(uxaDTO) {
        const dslQuery = this.dslService.getDSL(uxaDTO);
        //gs.info('DSL Query before QueryServiceAPI call. DSLQuery: ' + JSON.stringify(dslQuery));
        return this.dataConnector.query(dslQuery);
    },

    getFunnelData: function(uxaDTO) {
        const dslQuery = this.dslService.getFunnelDSL(uxaDTO);
        const result = this.dataConnector.funnelQuery(dslQuery);
        const transformer = this.baseTransformer.getTransformer(uxaDTO);
        const transformedData = transformer.transform(result, uxaDTO);
        return transformedData;
    },

    getNavigationPathsData: function(uxaDTO) {
        const dslQuery = this.dslService.getNavigationPathsDSL(uxaDTO);
        return this.dataConnector.getNavigationPaths(dslQuery);
    },

    getCohortData: function(uxaDTO) {
        const dslQuery = this.dslService.getCohortDSL(uxaDTO);
        const result = this.dataConnector.getCohort(dslQuery);
        const transformer = this.baseTransformer.getTransformer(uxaDTO);
        const transformedData = transformer.transform(result, uxaDTO);
        return transformedData;
    },

    getTransformedData: function(uxaDTO, data = null) {
        if (!data)
            data = this.getData(uxaDTO);
        const transformer = this.baseTransformer.getTransformer(uxaDTO);
        const transformedData = transformer.transform(data, uxaDTO);
        return transformedData;
    },

    getMetadata: function(payload, UXAFilterId, selectedValues) {

        this.dataConnector = new UXADataConnector().getMetadataConnector();
        //gs.info('Metadata Query before QueryServiceAPI call. MetadataQuery: ' + JSON.stringify(payload));
        let response;
        switch (UXAFilterId) {
            case UXAConstants.UXA_FILTER_ID.COUNTRY:
                response = this.dataConnector.getCountries(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.STATE:
                response = this.dataConnector.getRegions(payload);
				// TODO: remove this code after backend fixes
                if (Array.isArray(response)) {
                    if (response.every(item => typeof item === 'object' && item !== null)) {
                        response = response.map(obj => obj.v);
                    }
                }
                break;
            case UXAConstants.UXA_FILTER_ID.CITY:
                response = this.dataConnector.getCities(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.APPLICATION:
                response = this.dataConnector.getApplications(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.CHANNEL:
                response = response = this.dataConnector.getAppChannelTypes(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.USER_TYPE:
                response = response = this.dataConnector.getUserTypes(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.SESSION_TYPE:
                response = [];
                break;
            case UXAConstants.UXA_FILTER_ID.LOCALE:
                response = this.dataConnector.getLocales(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.LANGUAGE:
                response = this.dataConnector.getLanguages(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT:
                response = this.dataConnector.getEventNames(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.PAGE:
                response = this.dataConnector.getPageNames(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT_NAMES_BY_TYPE:
                response = this.dataConnector.getEventNamesByType(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_INDICATOR:
                response = this.dataConnector.getEventPropertiesIndicationData(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.OPERATING_SYSTEM:
                response = this.dataConnector.getOsTypes(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.VERSION:
                response = this.dataConnector.getOsVersions(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.BROWSER:
                response = this.dataConnector.getBrowserTypes(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.BROWSER_VERSION:
                response = this.dataConnector.getBrowserVersions(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.APP_VERSION:
                response = this.dataConnector.getAppVersions(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.DEVICE_TYPE:
                response = this.dataConnector.getDeviceTypes(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.DEVICE:
                response = this.dataConnector.getDevices(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY:
                response = this.dataConnector.getEventPropertyNames(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.CONNECTIVITY:
                response = this.dataConnector.getConnectivities(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_VALUE:
                response = this.dataConnector.getEventPropertyValues(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.DEVICE_RESOLUTION:
                response = [];
                break;
            case UXAConstants.UXA_FILTER_ID.USER_DETAILS:
                response = this.dataConnector.getUserDetails(payload);
                break;
            case UXAConstants.UXA_FILTER_ID.CUSTOM_USER_PROPERTIES:
                response = this.dataConnector.getCustomUserProperties(payload);
                break;
        }

        const metaTransformer = this.baseTransformer.getMetadataTransformer(UXAFilterId);
        const transformedData = metaTransformer.transform(response, selectedValues, UXAFilterId, payload);
        return transformedData;
    },

    getActivityTimelineData: function(uxaDTO) {
        const dsl = this.dslService.getSesionsActivityTimelineDSL(uxaDTO);
        return this.dataConnector.getSessionDataPoints(dsl);
    },

    getRetentionData: function(uxaDTO) {
        const retentionDSL = this.dslService.getRetentionDSL(uxaDTO);
        let response;
        switch (uxaDTO.getDataCategory()) {
            case UXAConstants.DATA_CATEGORY.COHORT:
                response = this.dataConnector.getRetentionCohort(retentionDSL);
                response = this.getTransformedData(uxaDTO, response);
                break;
            case UXAConstants.DATA_CATEGORY.SIMPLE:
            case UXAConstants.DATA_CATEGORY.GROUP:
                switch (uxaDTO.getMetricField()) {
                    case UXAConstants.METRIC_FIELD.RETENTION.NEVER_RETURNED_COUNT:
                        response = this.dataConnector.getNeverReturnedCount(retentionDSL);
                        break;
                    case UXAConstants.METRIC_FIELD.RETENTION.RETURNED_AFTER_TIME_COUNT:
                        response = this.dataConnector.getReturnedAfterTimeCount(retentionDSL);
                        break;
                    case UXAConstants.METRIC_FIELD.RETENTION.SESSION_FREQUENCY:
                        response = this.dataConnector.getSessionFrequency(retentionDSL);
                        break;
                    case UXAConstants.METRIC_FIELD.RETENTION.AVG_TIME_BETWEEN_SESSIONS:
                        response = this.dataConnector.getAvgTimeBetweenSessions(retentionDSL);
                        break;
                }
        }
        return response;
    },

    getSinglePageNavData: function(uxaDTO) {
        const dsl = this.dslService.getSinglePageNavDSL(uxaDTO);
        return this.dataConnector.getSinglePageNavData(dsl);
    },

    type: 'UXABaseService'
};
