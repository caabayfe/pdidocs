function transform(input) {
    // Extract and validate input parameters with defaults
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "http.inbound_api_integration";
    var startTime = (input && input.startTime) || "P3M";
    var endTime = (input && input.endTime) || null;
    var groupByField = (input && input.groupBy) || '';
    var groupByFields = groupByField ? groupByField.split(',').map(function(s) { return s.trim(); }) : [];
    var projections = (input && input.projections) || [];
    var predicateComposition = (input && input.predicateComposition) || {};
    var dataCategory = input.dataCategory || "simple";
    var metric = input.metric || "RecordCount";
    var egressDataSizeFormat = (input && input.egressDataSizeFormat) || '';
    if (egressDataSizeFormat) {
        metricName = 'http.inbound_api_integration.egress';
    }


    var filterConfigurations = (input && input.filterConfigurations) || "[]";

    var adaptor = new sn_integration_use.TelemetryQueryAdaptor();
    var useDirectQuery = (input && input.useDirectQuery !== undefined)
        ? (input.useDirectQuery === true || input.useDirectQuery === 'true')
        : true;

    function getScoreCount() {
        if (useDirectQuery) {
            var startTimeStr, endTimeStr;
            if (endTime) {
                var gdtStart = new GlideDateTime();
                gdtStart.setDisplayValue(startTime);
                startTimeStr = gdtStart.getValue().substring(0, 19);
                var gdtEnd = new GlideDateTime();
                gdtEnd.setDisplayValue(endTime);
                endTimeStr = gdtEnd.getValue().substring(0, 19);
            } else {
                var dateRange = adaptor.getAbsoluteDateRange(startTime);
                startTimeStr = dateRange.startTimeStr;
                endTimeStr = dateRange.endTimeStr;
            }

            var parsedFilterConfigurations = (typeof filterConfigurations === 'string')
                ? JSON.parse(filterConfigurations || '[]')
                : (filterConfigurations || []);
            var filterAnd = adaptor.buildFilterAndFromRange(serviceName, metricName, startTimeStr, endTimeStr, parsedFilterConfigurations);

            var parsedProjections = Array.isArray(projections) ? projections : [];
            if (!parsedProjections.length && typeof projections === 'string') {
                try { parsedProjections = JSON.parse(projections); } catch(e) { parsedProjections = []; }
            }

            var queryProjections;
            if (groupByFields.length > 0) {
                queryProjections = parsedProjections
                    .filter(function(p) { return p.key !== 'Total'; })
                    .map(function(p) { var proj = {}; proj[p.key] = p.label; return proj; });
                queryProjections.push(adaptor.buildSumProjection());
            } else {
                queryProjections = [{"$count": "MetricName", "alias": "MetricName_1"}];
            }

            var parsedPredicates = predicateComposition;
            if (typeof parsedPredicates === 'string') {
                try { parsedPredicates = JSON.parse(parsedPredicates); } catch(e) { parsedPredicates = {}; }
            }
            if (parsedPredicates && parsedPredicates.predicate &&
                Array.isArray(parsedPredicates.predicate.predicates) &&
                parsedPredicates.predicate.predicates.length > 0) {
                var predicateFilters = parsedPredicates.predicate.predicates.map(function(p) {
                    var prop = p.predicateProperties.selectedProperty;
                    var val = p.predicateProperties.selectedValue[0];
                    var cond = {};
                    cond[prop] = {"$eq": val};
                    return cond;
                });
                filterAnd.push({"$and": predicateFilters});
            }

            var payload = {
                "type": "telemetry_counter",
                "projection": queryProjections.length > 0 ? queryProjections : [{"MetricName": "MetricName"}],
                "filter": {"$and": filterAnd}
            };
            if (groupByFields.length > 1) {
                payload.group = groupByFields;
            } else if (groupByFields.length === 1) {
                payload.group = [{"name": groupByFields[0]}];
            }
            var data = adaptor.executeQuery(payload) || {};
            if (groupByFields.length > 0) {
                return data.rows ? data.rows.length : 0;
            }
            return (data.rows && data.rows.length > 0) ? data.rows[0][0] : 0;
        }

        // ---- getData path (original implementation)
        var dataConfig = {
            "data": {
                serviceName: {
                    key: 'StringAttributes.' + serviceName,
                    value: serviceName
                },
                metricName: {
                    key: 'StringAttributes.' + metricName,
                    value: metricName
                },
                predicateComposition: predicateComposition,
                "metricType": "counter",
                "metricUnit": "1",
                "dataType": "observability_data",
            },
            dataCategory: dataCategory,
            "startTime": startTime,
            "endTime": endTime,
            metric: metric,
            aggregationColumn: 'MetricName',
        };
        if (dataCategory == "list") {
            dataConfig.data.projections = projections.map(projection => ({
                        [projection.key]: projection.label
                    }));
        }
        if (groupByFields.length > 0) {
            dataConfig.aggregationColumn = groupByFields[0];
        }
        const get_data_payload = {
            "dataConfigurations": [dataConfig],
            filterConfigurations: filterConfigurations
        };
        var responses = new sn_telemetry_data.TelemetryDataHandler().getData(get_data_payload) || [];
        if (dataCategory == "simple")
            return responses[0] ? responses[0].response.data[1][0] : 0;
        else
            return (responses[0] && responses[0].rows) ? responses[0].rows.length : 0;
    };

    return {
        value: getScoreCount()
    };
}
