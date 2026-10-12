var UXADataController = Class.create();
UXADataController.prototype = {
    initialize: function() {
        this.requestValidator = new UXARequestValidator();
        this.responseTransformer = new UXAResponseTransformer();
        this.uxaHandler = new UXAHandler();
        this.uxaUtils = new UXAUtils();
    },

    frequentlyViewedPages: function(params) {
        // Validation schema for request params
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };

        //Validate Request
        this.requestValidator.validate(schema, params);

        const {
            startTime,
            endTime,
            applicationSysId,
            userId,
            limit,
        } = params;

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.PAGES)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setApplicationId(applicationSysId)
            .setUserId(userId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setColumns(["NAME", "VIEWS"])
            .setOrderBy("VIEWS")
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();

        return this.getResponse(payload);
    },

    frequentlyViewedPagesWithApplication: function(params) {
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };

        //Validate Request
        this.requestValidator.validate(schema, params);

        const {
            startTime,
            endTime,
            applicationSysId,
            userId,
            limit,
        } = params;

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.PAGES)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setApplicationId(applicationSysId)
            .setUserId(userId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setRequestSource(UXAConstants.UXA_DATA_CONTROLLER_SOURCE)
            .setColumns(["NAME", "VIEWS", "APPLICATION"])
            .setOrderBy("VIEWS")
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();

        return this.getResponse(payload);
    },

    frequentlyAccessedApps: function(params) {
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };

        //Validate Request
        this.requestValidator.validate(schema, params);

        const {
            startTime,
            endTime,
            userId,
            limit,
        } = params;

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.APPLICATION)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setUserId(userId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setColumns(["NAME", "SESSIONS"])
            .setOrderBy("SESSIONS")
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();

        return this.getResponse(payload);
    },

    recentlyAccessedPages: function(params) {
        // Validation schema for request params
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };

        //Validate Request
        this.requestValidator.validate(schema, params);

        const {
            startTime,
            endTime,
            applicationSysId,
            userId,
            limit,
        } = params;

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.PAGES)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setApplicationId(applicationSysId)
            .setUserId(userId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setColumns(["NAME", "MAX_TIMESTAMP"])
            .setOrderBy("MAX_TIMESTAMP")
            .setRequestSource(UXAConstants.UXA_DATA_CONTROLLER_SOURCE)
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();

        return this.getResponse(payload);
    },

    recentlyAccessedApps: function(params) {
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };

        //Validate Request
        this.requestValidator.validate(schema, params);

        const {
            startTime,
            endTime,
            userId,
            limit,
        } = params;

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.APPLICATION)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setUserId(userId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setColumns(["NAME", 'MAX_START_TIME'])
            .setOrderBy("MAX_START_TIME")
            .setRequestSource(UXAConstants.UXA_DATA_CONTROLLER_SOURCE)
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();

        return this.getResponse(payload);
    },

    getResponse: function(payload) {
        const responses = this.uxaHandler.handleDARequest(payload);
        let response = {};
        if (responses?.[0]?.[0])
            response = this.responseTransformer.transform(responses[0][0]);

        return response;
    },

    frequentlyAccessedUserTables: function(params) {
        const {
            startTime,
            endTime,
            applicationSysId = null,
            limit = 10,
            userId,
            table_names = [],
        } = params;

        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };
        this.requestValidator.validate(schema, params);

        // form the requests for the tables
        const filterConfigs = [];

        //for TABLE Properties
        filterConfigs.push({
            event_property: [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE],
            event: UXAConstants.TABLE_EVENTS[UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE],
            [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: table_names
        });

        // for SN_Page properties
        filterConfigs.push({
            event_property: [UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE],
            event: UXAConstants.TABLE_EVENTS[UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE],
            [UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE]: table_names.flatMap((table) => this.uxaUtils.convertTableToPageNames(table)),
        });

        const tableResultSet = [];
        filterConfigs.forEach((filterConfig) => {
            const event_property = filterConfig.event_property[0];
            const payload = new UXAConfigurationBuilder()
                .setMetric(UXAConstants.METRIC.TABLE)
                .setType(UXAConstants.TYPE.EVENTS)
                .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
                .setApplicationId(applicationSysId)
                .setStartTime(startTime)
                .setEndTime(endTime)
                .setPageSize(event_property === UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE ? limit * 3 : limit)
                .setColumns([event_property, "OCCURRENCES"])
                .setGroupBys([event_property])
                .setOrderBy("OCCURRENCES")
                .setUserId(userId)
                .setSortOrder(UXAConstants.SORT_ORDER_DESC)
                .addFilterConfiguration(filterConfig)
                .addDataConfiguration()
                .build();
            this.getResponse(payload).data.forEach((result) => {
                if (event_property === UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE && this.uxaUtils.hasValidTablePageName(result[UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_PAGE])) {
                    tableResultSet.push({
                        "OCCURRENCES": result["OCCURRENCES"],
                        [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: this.uxaUtils.normalizeTableNames(result[UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_PAGE])
                    });
                } else if (event_property === UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE) {
                    tableResultSet.push(result);
                }
            });
        });

        const result = Object.entries(tableResultSet.reduce((acc, {
                "OCCURRENCES": occ,
                [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: table
            }) => {
                acc[table] = acc[table] ? acc[table] + parseInt(occ) : parseInt(occ);
                return acc;
            }, {}))
            .map(([table, OCCURRENCES]) => ({
                [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: table,
                OCCURRENCES
            }))
            .sort((a, b) => b.OCCURRENCES - a.OCCURRENCES);
        return {
            data: result.slice(0, limit)
        };
    },

    frequentlyAccessedEventsWithApplication: function(params) {
        const {
            startTime,
            endTime,
            applicationSysId = null,
            limit = 10,
            pageId = '',
            userId,
        } = params;
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            pageId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
        };
        this.requestValidator.validate(schema, params);

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.EVENTS)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setApplicationId(applicationSysId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setPageId(pageId)
            .setUserId(userId)
            .setRequestSource(UXAConstants.UXA_DATA_CONTROLLER_SOURCE)
            .setColumns(["NAME", "OCCURRENCES", "APPLICATION"])
            .setGroupBys(["NAME", "APPLICATION"])
            .setOrderBy("OCCURRENCES")
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();
        return this.getResponse(payload);
    },

    recentlyAccessedEvents: function(params) {
        const {
            startTime,
            endTime,
            applicationSysId = null,
            limit = 10,
            userId,
            pageId,
        } = params;
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 100),
            pageId: ValidationRules.OPTIONAL_STRING(5, 100),
        };
        this.requestValidator.validate(schema, params);
        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.EVENTS)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setApplicationId(applicationSysId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setUserId(userId)
            .setPageId(pageId)
            .setColumns(["NAME", "MAX_TIMESTAMP"])
            .setOrderBy("MAX_TIMESTAMP")
            .setRequestSource(UXAConstants.UXA_DATA_CONTROLLER_SOURCE)
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .build();
        return this.getResponse(payload);
    },

    recentlyAccessedUserTables: function(params) {
        const {
            startTime,
            endTime,
            applicationSysId = null,
            limit = 10,
            userId,
            table_names = [],
        } = params;

        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 200),
            table_names: ValidationRules.OPTIONAL_LIST,
        };
        this.requestValidator.validate(schema, params);
        // form the requests for the tables
        const filterConfigs = [];

        //for TABLE Properties
        filterConfigs.push({
            event_property: [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE],
            event: UXAConstants.TABLE_EVENTS[UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE],
            [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: table_names
        });

        // for SN_Page properties
        filterConfigs.push({
            event_property: [UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE],
            event: UXAConstants.TABLE_EVENTS[UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE],
            [UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE]: table_names.flatMap((table) => this.uxaUtils.convertTableToPageNames(table)),
        });

        const tableResultSet = [];
        filterConfigs.forEach((filterConfig) => {
            const event_property = filterConfig.event_property[0];
            const payload = new UXAConfigurationBuilder()
                .setMetric(UXAConstants.METRIC.TABLE)
                .setType(UXAConstants.TYPE.EVENTS)
                .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
                .setApplicationId(applicationSysId)
                .setStartTime(startTime)
                .setEndTime(endTime)
                .setPageSize(event_property === UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE ? limit * 3 : limit)
                .setColumns([event_property, "MAX_TIMESTAMP"])
                .setGroupBys([event_property])
                .setOrderBy("MAX_TIMESTAMP")
                .setUserId(userId)
                .setSortOrder(UXAConstants.SORT_ORDER_DESC)
                .addFilterConfiguration(filterConfig)
                .addDataConfiguration()
                .build();
            this.getResponse(payload).data.forEach((result) => {
                if (event_property === UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE && this.uxaUtils.hasValidTablePageName(result[UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_PAGE])) {
                    tableResultSet.push({
                        TIMESTAMP: result["TIMESTAMP"],
                        [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: this.uxaUtils.normalizeTableNames(result[UXAConstants.DATA_POINTS_COLUMNS.STR_SYS_PROP_PAGE])
                    });
                } else if (event_property === UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE) {
                    tableResultSet.push(result);
                }
            });
        });

        const sortedResult = tableResultSet.sort((a, b) => new Date(b.TIMESTAMP.replace(" ", "T")) - new Date(a.TIMESTAMP.replace(" ", "T")));

        const result = Object.entries(sortedResult.reduce((acc, item) => {
            if (!acc[item[UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]])
                acc[item[UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]] = item.TIMESTAMP;
            return acc;
        }, {})).map(([table, TIMESTAMP]) => ({
            [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: table,
            TIMESTAMP
        }));
        return {
            data: result.slice(0, limit)
        };
    },

    frequentlyAccessedEventsWithApplicationAndPages: function(params) {
        const schema = {
            startTime: ValidationRules.REQUIRED_DATE,
            endTime: ValidationRules.REQUIRED_DATE,
            limit: ValidationRules.REQUIRED_NUMBER(1, 100),
            applicationSysId: ValidationRules.OPTIONAL_STRING(5, 100),
            userId: ValidationRules.OPTIONAL_STRING(5, 100),
        };

        this.requestValidator.validate(schema, params);

        const {
            startTime,
            endTime,
            applicationSysId = null,
            pageId,
            limit = 10,
            userId,
        } = params;

        const filterConfig = {
            [UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE]: [pageId],
        };

        const payload = new UXAConfigurationBuilder()
            .setMetric(UXAConstants.METRIC.TABLE)
            .setType(UXAConstants.TYPE.EVENTS)
            .setDataCategory(UXAConstants.DATA_CATEGORY.DATATABLE)
            .setApplicationId(applicationSysId)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setPageSize(limit)
            .setUserId(userId)
            .setRequestSource(UXAConstants.UXA_DATA_CONTROLLER_SOURCE)
            .setColumns(["NAME", "APPLICATION", UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE, "OCCURRENCES"])
            .setGroupBys(["NAME", "APPLICATION", UXAConstants.TABLE_COLUMN_PROPERTY_NAME_MAP[UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE]])
            .setOrderBy("OCCURRENCES")
            .setSortOrder(UXAConstants.SORT_ORDER_DESC)
            .addDataConfiguration()
            .addFilterConfiguration(filterConfig)
            .build();
        return this.getResponse(payload);
    },

    type: 'UXADataController'
};
