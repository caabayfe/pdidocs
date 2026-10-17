var UXADTO = Class.create();
UXADTO.prototype = {
    initialize: function() {
        this.requestType = '';
        this.dataCategory = '';
        this.dataConfigType = '';
        this.metric = '';
        this.metricDivision = '';
        this.metricField = '';
        this.typeDivision = '';
        this.category = '';
        this.type = '';
        this.startTime = '';
        this.endTime = '';
        this.includeChange = false;
        this.includeChangePercentage = false;
        this.includeTrendData = false;
        this.includeSparkline = false;
        this.trendInterval = '';
        this.groupBys = [];
        this.pageNumber = 0;
        this.pageSize = 0;
        this.applicationSysId = '';
        this.channel = '';
        this.orderBy = '';
        this.sortOrder = 'desc';
        this.filters = [];
        this.sessionId = '';
        this.userId = '';
        this.eventId = '';
        this.pageId = '';
        this.selectedColumns = [];
        this.searchTerm = '';
        this.filterConfigurations;
        this.isExport = false;
        this.eventProperties = [];
        this.traceType = '';
        this.predicateComposition = {};
        this.pageName = '';
        this.samplingLevel = null;
        this.bucketType = '';
        this.excludeAttributes = [];
        this.processedFilters = {
            appliedFilters: [],
            notAppliedFilters: []
        };
        this.isShowOther = false;
        this.numberOfGroups = 10; //Default for UXA Dashboard
        this.requestSource = '';
    },

    getRequestType: function() {
        return this.requestType;
    },

    setRequestType: function(requestType) {
        this.requestType = requestType;
    },

    getDataCategory: function() {
        return this.dataCategory;
    },

    setDataCategory: function(dataCategory) {
        this.dataCategory = dataCategory;
    },

    getDataConfigType: function() {
        return this.dataConfigType;
    },

    setDataConfigType: function(dataConfigType) {
        this.dataConfigType = dataConfigType;
    },

    getMetric: function() {
        return this.metric;
    },

    setMetric: function(metric) {
        this.metric = metric;
    },

    getMetricDivision: function() {
        return this.metricDivision;
    },

    setMetricDivision: function(metricDivision) {
        this.metricDivision = metricDivision;
    },

    getMetricField: function() {
        return this.metricField;
    },

    setMetricField: function(metricField) {
        this.metricField = metricField;
    },

    getTypeDivision: function() {
        return this.typeDivision;
    },

    setTypeDivision: function(typeDivision) {
        this.typeDivision = typeDivision;
    },

    getCategory: function() {
        return this.category;
    },

    setCategory: function(category) {
        this.category = category;
    },

    getType: function() {
        return this.type;
    },

    setType: function(type) {
        this.type = type;
    },

    getStartTime: function() {
        return this.startTime;
    },

    setStartTime: function(startTime) {
        this.startTime = startTime;
    },

    getEndTime: function() {
        return this.endTime;
    },

    setEndTime: function(endTime) {
        this.endTime = endTime;
    },

    isIncludeChange: function() {
        return this.includeChange;
    },

    setIncludeChange: function(includeChange) {
        this.includeChange = includeChange;
    },

    isIncludeChangePercentage: function() {
        return this.includeChangePercentage;
    },

    setIncludeChangePercentage: function(includeChangePercentage) {
        this.includeChangePercentage = includeChangePercentage;
    },

    isIncludeTrendData: function() {
        return this.includeTrendData;
    },

    setIncludeTrendData: function(includeTrendData) {
        this.includeTrendData = includeTrendData;
    },

    isIncludeSparkline: function() {
        return this.includeSparkline;
    },

    setIncludeSparkline: function(includeSparkline) {
        this.includeSparkline = includeSparkline;
    },

    getTrendInterval: function() {
        return this.trendInterval;
    },

    setTrendInterval: function(trendInterval) {
        this.trendInterval = trendInterval;
    },

    getGroupBys: function() {
        return this.groupBys;
    },

    setGroupBys: function(groupBys = []) {
        this.groupBys = groupBys;
    },

    addGroupBy: function(groupBy) {
        if (groupBy)
            this.groupBys.push(groupBy);
    },

    getPageNumber: function() {
        return this.pageNumber;
    },

    setPageNumber: function(pageNumber) {
        this.pageNumber = pageNumber;
    },

    getPageSize: function() {
        return this.pageSize;
    },

    setPageSize: function(pageSize) {
        this.pageSize = +pageSize;
    },

    getApplicationSysId: function() {
        return this.applicationSysId;
    },

    setApplicationSysId: function(applicationSysId) {
        if (applicationSysId?.toUpperCase() != UXAConstants.ALL)
            this.applicationSysId = applicationSysId;
    },

    getChannel: function() {
        return this.channel;
    },

    setChannel: function(channel) {
        if (channel?.toUpperCase() != UXAConstants.ALL)
            this.channel = channel;
    },

    getOrderBy: function() {
        return this.orderBy;
    },

    setOrderBy: function(orderBy) {
        this.orderBy = orderBy;
    },

    getSortOrder: function() {
        return this.sortOrder;
    },

    setSortOrder: function(sortOrder = UXAConstants.SORT_ORDER_DESC) {
        this.sortOrder = sortOrder;
    },

    getFilters: function() {
        return this.filters;
    },

    setFilters: function(filters) {
        this.filters = filters;
    },

    getSessionId: function() {
        return this.sessionId;
    },

    setSessionId: function(sessionId) {
        this.sessionId = sessionId;
    },

    getUserId: function() {
        return this.userId;
    },

    setUserId: function(userId) {
        this.userId = userId;
    },

    getEventId: function() {
        return this.eventId;
    },

    setEventId: function(eventId) {
        this.eventId = eventId;
    },

    getPageId: function() {
        return this.pageId;
    },

    setPageId: function(pageId) {
        this.pageId = pageId;
    },

    getSelectedColumns: function() {
        return this.selectedColumns;
    },

    setSelectedColumns: function(selectedColumns = []) {
        this.selectedColumns = selectedColumns;
    },

    getSearchTerm: function() {
        return this.searchTerm;
    },

    setSearchTerm: function(searchTerm) {
        this.searchTerm = searchTerm;
    },

    getFilterConfigurations: function() {
        return this.filterConfigurations;
    },

    setFilterConfigurations: function(filterConfigurations) {
        this.filterConfigurations = filterConfigurations;
    },

    setIsExport: function(isExport) {
        this.isExport = isExport;
    },

    getIsExport: function() {
        return this.isExport;
    },

    setEventProperties: function(eventProperties) {
        this.eventProperties = eventProperties || [];
    },
    getEventProperties: function() {
        return this.eventProperties;
    },

    setTraceType: function(traceType) {
        this.traceType = traceType;
    },

    getTraceType: function() {
        return this.traceType;
    },

    getSysId: function() {
        return this.sysId;
    },

    setSysId: function(sysId) {
        this.sysId = sysId;
    },

    getLegacyId: function() {
        return this.legacyId;
    },

    setLegacyId: function(legacyId) {
        this.legacyId = legacyId;
    },

    setFunnelSteps: function(steps) {
        this.funnelSteps = steps;
    },

    getFunnelSteps: function(steps) {
        return this.funnelSteps;
    },

    setFunnelFlag: function(flag) {
        this.funnelFlag = flag;
    },

    getFunnelFlag: function() {
        return this.funnelFlag;
    },

    setCohortSteps: function(steps) {
        this.cohortSteps = steps;
    },

    getCohortSteps: function() {
        return this.cohortSteps;
    },

    setCohortFlag: function(flag) {
        this.funnelFlag = flag;
    },

    getCohortFlag: function() {
        return this.funnelFlag;
    },

    getNavPageName: function() {
        return this.navPageName;
    },

    setNavPageName: function(navPageName) {
        this.navPageName = navPageName;
    },

    setPredicateComposition: function(predicateComposition) {
        this.predicateComposition = predicateComposition;
    },

    getPredicateComposition: function() {
        return this.predicateComposition;
    },

    setSamplingLevel: function(samplingLevel) {
        this.samplingLevel = samplingLevel;
    },

    getSamplingLevel: function() {
        return this.samplingLevel;
    },

    setBucketType: function(bucketType) {
        this.bucketType = bucketType;
    },

    getBucketType: function() {
        return this.bucketType;
    },

    setExcludeAttributes: function(excludeAttributes = []) {
        this.excludeAttributes = excludeAttributes;
    },

    getExcludeAttributes: function() {
        return this.excludeAttributes;
    },

    getProcessedFilters: function() {
        return this.processedFilters;
    },

    setIsShowOther: function(isShowOther) {
        this.isShowOther = isShowOther;
    },

    getIsShowOther: function() {
        return this.isShowOther;
    },

    setNumberOfGroups: function(numberOfGroups) {
        this.numberOfGroups = numberOfGroups;
    },

    getNumberOfGroups: function() {
        return this.numberOfGroups;
    },

    setRequestSource: function(requestSource) {
        this.requestSource = requestSource;
    },

    getRequestSource: function() {
        return this.requestSource;
    },

    setComponentInstance: function(componentInstance) {
        this.componentInstance = componentInstance;
    },

    getComponentInstance: function() {
        return this.componentInstance
    },

	setVisuallyTaggedId: function(visuallyTaggedId) {
		this.visuallyTaggedId = visuallyTaggedId;
	},

	getVisuallyTaggedId: function() {
		return this.visuallyTaggedId;
	},

    type: 'UXADTO'
};
