function transform(input) {
    // Extract and validate input parameters with defaults
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "http.inbound_api_integration";
    var startTime = (input && input.startTime) || "P3M";
    var metric = (input && input.metric) || "count";
    var label = (input && input.label) || "Count";
    
    // Parse filterConfigurations from JSON string
    var filterConfigurationsInput = (input && input.filterConfigurations) || "[]";
    var filterConfigurations;
    try {
        if (typeof filterConfigurationsInput === 'string') {
            filterConfigurations = JSON.parse(filterConfigurationsInput);
        } else {
            filterConfigurations = filterConfigurationsInput;
        }
    } catch (e) {
        filterConfigurations = [];
    }

    var useDirectQuery = (input && input.useDirectQuery !== undefined)
        ? (input.useDirectQuery === true || input.useDirectQuery === 'true')
        : true;

    var data;

    if (useDirectQuery) {
        var adaptor = new sn_integration_use.TelemetryQueryAdaptor();
        var filterAnd = adaptor.buildFilterAnd(serviceName, metricName, startTime, filterConfigurations);

        var queryPayload = {
            "type": "telemetry_counter",
            "projection": [adaptor.buildSumProjection()],
            "filter": {"$and": filterAnd}
        };

        var queryResult = adaptor.executeQuery(queryPayload) || {};
        var scoreValue = (queryResult.rows && queryResult.rows.length > 0) ? queryResult.rows[0][0] : 0;

        var scoreGdt = new GlideDateTime();
        var scoreDateStr = scoreGdt.getLocalDate().getValue();
        var scoreStart = new GlideDateTime();
        scoreStart.setDisplayValueInternal(scoreDateStr + ' 00:00:00');
        var scoreEnd = new GlideDateTime();
        scoreEnd.setDisplayValueInternal(scoreDateStr + ' 23:59:59');

        data = {
            response: {
                data: [["Total"], [scoreValue]],
                metadata: {
                    aggregate:         {fieldType: 'decimal', function: metric, name: metricName},
                    aggregateBy:       0,
                    aggregateFunction: metric,
                    format:            {frequency: 'daily', precision: 0, unitFormat: '{0}'},
                    metricName:        metricName,
                    scoreDate:         scoreStart.getNumericValue() + ',' + scoreEnd.getNumericValue(),
                    timeZone:          'SESSION'
                },
                filters: {appliedFilters: [], notAppliedFilters: []}
            }
        };
    } else {
        var payload = {
            "dataConfigurations": [{
                "requestSourceType": "observability",
                "trendBy": "",
                "sourceType": "CUSTOM",
                "sortBy": "VALUE",
                "sortOrder": "DESC",
                "filterElements": [],
                "aggregateBy": 4,
                "groupBy": [],
                "data": {
                    "serviceName": {
                        "key": "StringAttributes." + serviceName,
                        "value": serviceName
                    },
                    "metricName": {
                        "key": "StringAttributes." + metricName,
                        "value": metricName
                    },
                    "metricType": "counter",
                    "metricUnit": "1",
                    "dataType": "observability_data",
                    "metric": metric,
                    "label": label,
                    "aggregationColumn": "count"
                },
                "groupByDetails": [{}],
                "type": "metrics",
                "dataCategory": "simple",
                "startTime": startTime,
                "selectedMetricType": "basic-stats",
                "endTime": null,
                "metric": metric,
                "label": label,
            }],
            "filterConfigurations": filterConfigurations
        };

        var responses = new sn_telemetry_data.TelemetryDataHandler().getData(payload) || [];
        data = responses[0] || {};
    }

    // Transform data array format for single score
    if (data.response && data.response.data && Array.isArray(data.response.data)) {
        var rawData = data.response.data;

        // Check if we have at least 2 rows (header + data)
        if (rawData.length >= 2 && Array.isArray(rawData[1]) && rawData[1].length > 0) {
            var scoreValue = rawData[1][0]; // Get the actual score value
            if (metricName === 'http.inbound_api_integration.egress') {
                var bytes = parseFloat(scoreValue) || 0;
                scoreValue = parseFloat((bytes / (1024 * 1024)).toFixed(2));
            }
            // Transform to single score format
            data.response.data = [{
                "value": scoreValue.toString(),
                "change": "0",
                "changePercent": "0"
            }];
        } else {
            // No data available, return default
            data.response.data = [{
                "value": "0",
                "change": "0",
                "changePercent": "0"
            }];
        }
    }

    return [data.response];
}
