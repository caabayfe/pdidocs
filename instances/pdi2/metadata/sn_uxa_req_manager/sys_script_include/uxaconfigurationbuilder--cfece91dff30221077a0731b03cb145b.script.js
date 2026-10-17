var UXAConfigurationBuilder = Class.create();
UXAConfigurationBuilder.prototype = {
    initialize: function() {
        this.dataConfigurations = [];
        this.filterConfigurations = [];
        this.dataConfiguration = {};
    },

    // Configuration setters
    setMetric: function(metric) {
        if (metric)
            this.dataConfiguration.metric = metric;
        return this;
    },

    setType: function(type) {
        if (type)
            this.dataConfiguration.type = type;
        return this;
    },

    setDataCategory: function(dataCategory) {
        if (dataCategory)
            this.dataConfiguration.dataCategory = dataCategory;
        return this;
    },

    setApplicationId: function(applicationId) {
        if (applicationId)
            this.dataConfiguration.applicationId = applicationId;
        return this;
    },

    setUserId: function(userId) {
        if (userId)
            this.dataConfiguration.userId = userId;
        return this;
    },

    setStartTime: function(startTime) {
        if (startTime)
            this.dataConfiguration.startTime = startTime;
        return this;
    },

    setEndTime: function(endTime) {
        if (endTime)
            this.dataConfiguration.endTime = endTime;
        return this;
    },

    setPageNumber: function(pageNumber) {
        if (pageNumber)
            this.dataConfiguration.pageNumber = pageNumber;
        return this;
    },

    setPageSize: function(pageSize) {
        if (pageSize)
            this.dataConfiguration.pageSize = pageSize;
        return this;
    },

    setColumns: function(columns) {
        if (columns && Array.isArray(columns))
            this.dataConfiguration.columns = columns;
        return this;
    },

    setSearchTerm: function(searchTerm) {
        if (searchTerm)
            this.dataConfiguration.searchTerm = searchTerm;
        return this;
    },

    setOrderBy: function(orderBy) {
        if (orderBy)
            this.dataConfiguration.orderBy = orderBy;
        return this;
    },

    setSortOrder: function(sortOrder) {
        if (sortOrder)
            this.dataConfiguration.sortOrder = sortOrder;
        return this;
    },

    setGroupBys: function(groupBys) {
        if (groupBys)
            this.dataConfiguration.groupBy = groupBys;
        return this;
    },

    // Add built config to dataConfigurations array
    addDataConfiguration: function() {
        this.dataConfigurations.push({
            ...this.dataConfiguration
        });
        this.dataConfiguration = {}; // reset for next configuration
        return this;
    },

    setPageId: function(pageId) {
        if (pageId)
            this.dataConfiguration.pageId = pageId;
        return this;
    },

    setRequestSource: function(requestSource) {
        if (requestSource)
            this.dataConfiguration.requestSource = requestSource;
        return this;
    },

    // Filters
    addFilterConfiguration: function(filterConfig) {
        Object.keys(filterConfig).forEach(filterId => {
            const value = filterConfig[filterId];
            if (
                !value ||
                (Array.isArray(value) &&
                    value.length === 0
                ) ||
                (Array.isArray(value) &&
                    value.every(item => item === undefined))
            )
                return;

            const updatedValue = Array.isArray(value) ? value : [value];
            this.filterConfigurations.push({
                order: 0,
                filterId: filterId,
                values: updatedValue,
                apply_to: [{
                    type: 'appsee',
                    payload: {
                        UXAFilterId: filterId,
                    },
                }, ],
            });
        });

        return this;
    },

    build: function() {
        return {
            dataConfigurations: this.dataConfigurations,
            filterConfigurations: this.filterConfigurations
        };
    },

    type: 'UXAConfigurationBuilder'
};
