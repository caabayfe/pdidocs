var CMDBWsHealthDashboardUtil = Class.create();
CMDBWsHealthDashboardUtil.prototype = {

    CMDB_HEALTH_RESULT: "cmdb_health_result",
    CMDB_GROUP_RESULT: "cmdb_health_result_group_map",
    CMDB_SERVICE_RESULT: "cmdb_health_result_service_map",
    CMDB_HEALTH_METRIC: "cmdb_health_metric",
    CLASS_NAME: "class_name",
    GROUP: "group",
    SERVICE: "service",
    COUNT: "COUNT",
    READ_REPLICA_CATEGORY: "cmdb_health_score",

    initialize: function() {},

    getSubMetrics: function(dataType, id, metric) {
        this.id = id;
        var classList = new GlideTableHierarchy(id).getAllExtensions();
        this.classMap = {};
        for (var i = 0; i < classList.length; i++) {
            this.classMap[classList[i]] = true;
        }
        this.metric = metric;
        this.metricSysId = this._getMetricSysId(metric);

        if (!this.metricSysId) {
            return [];
        }
        var gr = this._getGrForType(dataType);
        this._setTypeColumns(dataType);
        if (dataType == 'class') {
            return this._getResultsForCMDBCi(gr);
        } else {
            return this._getResultsForServiceOrGroup(gr);
        }
    },

    _getMetricSysId: function(metricName) {
        var gr = new GlideRecord(this.CMDB_HEALTH_METRIC);
        gr.addQuery("name", metricName);
        gr.setCategory(this.READ_REPLICA_CATEGORY);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr.getUniqueValue() : null;
    },
    getPieCharts: function(dataType, id, metric, classNameFilter) {
        this.metric = metric;
        this.id = id;

        // these methods do a lot of set up that we will need for the pie charts
        var gr = this._getGrForType(dataType);
        this._setTypeColumns(dataType);

        var result = {
            "chartData": this._getPieChartData(classNameFilter),
            "ownershipGroupBy": this._getOwnershipData(),
            "discoverySourceGroupBy": this._getDiscoverySourceData(),
            "metric": this._getDefaultMetric()
        };

        return result;
    },

    _getGrForType: function(dataType) {
        var gr;

        if (dataType == 'class') {
            this.tableName = this.CMDB_HEALTH_RESULT;
            gr = new GlideAggregate(this.tableName);
        } else if (dataType == 'service') {
            this.tableName = this.CMDB_SERVICE_RESULT;
            this.groupOrServiceColumn = this.SERVICE;

            gr = new GlideAggregate(this.tableName);

            // if the id passed in is a class, filter by the class, otherwise filter by the service sys id
            var validatorGr = new GlideRecord(this.id);
            if (validatorGr.isValid()) {
                gr.addEncodedQuery("service.sys_class_nameINSTANCEOF" + this.id, true);
            } else {
                this.groupOrService = this.id;

                gr.addQuery(this.SERVICE, this.id);
            }
        } else if (dataType == 'group') {
            this.tableName = this.CMDB_GROUP_RESULT;
            this.groupOrServiceColumn = this.GROUP;
            this.groupOrService = this.id;

            gr = new GlideAggregate(this.tableName);
            gr.addQuery(this.GROUP, this.id);
        } else {
            gr = null;
        }

        return gr;
    },

    _setTypeColumns: function(dataType) {
        if (dataType == 'class') {
            this.metricColumn = "metric.name";
            this.metricColumnForTableQuery = "metric";
            this.classColumn = this.CLASS_NAME;
            this.activeColumn = "active";
            this.ownershipColumn = "ownership";
            this.discoverySourceColumn = "discovery_source";
        } else if (dataType == 'service') {
            this.metricColumn = "health_result.metric.name";
            this.metricColumnForTableQuery = "health_result.metric";
            this.classColumn = "health_result.class_name";
            this.activeColumn = "health_result.active";
            this.ownershipColumn = "health_result.ownership";
            this.discoverySourceColumn = "health_result.discovery_source";
        } else if (dataType == 'group') {
            this.metricColumn = "result.metric.name";
            this.metricColumnForTableQuery = "result.metric";
            this.classColumn = "result.class_name";
            this.activeColumn = "result.active";
            this.ownershipColumn = "result.ownership";
            this.discoverySourceColumn = "result.discovery_source";
        }
    },

    _getResultsForCMDBCi: function(gr) {
        gr.addQuery(this.activeColumn, true);
        gr.addQuery(this.metricColumnForTableQuery, this.metricSysId);
        gr.addAggregate(this.COUNT, this.classColumn);
        gr.setCategory(this.READ_REPLICA_CATEGORY);
        gr.query();

        var classCount = [];
        while (gr.next()) {
            var curClass = gr.getValue(this.classColumn);
            if (this.classMap[curClass]) {
                classCount.push({
                    total: gr.getAggregate(this.COUNT, this.classColumn),
                    classValue: curClass
                });
            }
        }
        classCount.sort(function(a, b) {
            return b.total - a.total;
        });
        classCount = classCount.slice(0, 10);
        var results = [];
        for (var i = 0; i < classCount.length; i++) {
            var total = classCount[i].total;
            var classValue = classCount[i].classValue;

            results.push({
                "total": total,
                "class": classValue,
                "name": this._getClassName(classValue),
                "chartData": this._getPieChartData(classValue),
                "ownershipGroupBy": this._getOwnershipData(),
                "discoverySourceGroupBy": this._getDiscoverySourceData(),
                "metric": this.metric
            });
        }

        return results;
    },

    _getResultsForServiceOrGroup: function(gr) {
        var results = [];

        gr.addQuery(this.activeColumn, true);
        gr.addQuery(this.metricColumn, this.metric);
        gr.addAggregate(this.COUNT, this.classColumn);
        gr.orderByAggregate(this.COUNT, this.classColumn);
        gr.setLimit(9);
		gr.setCategory(this.READ_REPLICA_CATEGORY);
        gr.query();

        while (gr.next()) {
            results.push({
                "total": gr.getAggregate(this.COUNT, this.classColumn),
                "name": this._getClassName(gr.getValue(this.classColumn)),
                "class": gr.getValue(this.classColumn),
                "metric": this.metric,
                "chartData": this._getPieChartData(gr.getValue(this.classColumn)),
                "ownershipGroupBy": this._getOwnershipData(),
                "discoverySourceGroupBy": this._getDiscoverySourceData()
            });
        }

        return results;
    },

    _getClassName: function(className) {
        var gr = new GlideRecord(className);
        return gr.getClassDisplayValue();
    },

    _getPieChartData: function(className) {
        var filterQuery = this.metricColumn + "=" + this.metric + "^" + this.classColumn + "=" + className;

        if (this.groupOrService) {
            filterQuery = filterQuery + "^" + this.groupOrServiceColumn + "=" + this.groupOrService;
        }

        return [{
            "id": "dGFibGVjbWRiX2hlYWx0aF9yZXN1bHQxNzEwODE2NDU4MjYx",
            "label": "CMDB Health Result",
            "sourceType": "table",
            "tableOrViewName": this.tableName,
            "filterQuery": this.activeColumn + '=true^' + filterQuery,
            "dataCategories": [
                "trend",
                "group",
                "simple"
            ],
            "isDatabaseView": false,
            "allowRealTime": true,
            "preferredVisualizations": "d24d53f60350de7a652caf3188a46ed2"
        }];
    },

    _getOwnershipData: function() {
        return [{
            "groupBy": [{
                "dataSource": "dGFibGVjbWRiX2hlYWx0aF9yZXN1bHQxNzEwODE2NDU4MjYx",
                "groupByField": this.ownershipColumn,
                "isPaBucket": false,
                "isRange": false
            }],
            "hideZeroValues": true,
            "maxNumberOfGroups": "ALL",
            "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
            "showOthers": true
        }];
    },

    _getDiscoverySourceData: function() {
        return [{
            "groupBy": [{
                "dataSource": "dGFibGVjbWRiX2hlYWx0aF9yZXN1bHQxNzEwODE2NDU4MjYx",
                "groupByField": this.discoverySourceColumn,
                "isPaBucket": false,
                "isRange": false
            }],
            "hideZeroValues": true,
            "maxNumberOfGroups": "ALL",
            "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
            "showOthers": true
        }];
    },

    _getDefaultMetric: function() {
        var metric = [{
            "aggregateFunction": "COUNT",
            "axisId": "primary",
            "dataSource": "dGFibGVjbWRiX2hlYWx0aF9yZXN1bHQxNzEwODE2NDU4MjYx",
            "id": "ZEdGaWJHVmpiV1JpWDJobFlXeDBhRjl5WlhOMWJIUXhOekV3T0RFMk5EVTRNall4MTcxMDgxNjQ2MDQ1OA",
            "numberFormat": {
                "customFormat": false
            }
        }];
        return metric;
    },
    type: 'CMDBWsHealthDashboardUtil'
};
