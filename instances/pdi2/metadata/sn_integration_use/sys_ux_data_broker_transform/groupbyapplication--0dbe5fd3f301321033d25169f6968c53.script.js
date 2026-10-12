function transform(input) {
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "http.inbound_api_integration";
    var startTime = (input && input.startTime) || "P3M";
    var numberOfGroupsRaw = (input && input.numberOfGroups) || 10;
    var numberOfGroups = parseInt(numberOfGroupsRaw, 10);
    var showOther = (input && input.showOther !== undefined) ? input.showOther : true;

    var filterConfigurationsRaw = (input && input.filterConfigurations) || "[]";
    var useDirectQuery = (input && input.useDirectQuery !== undefined)
        ? (input.useDirectQuery === true || input.useDirectQuery === 'true')
        : true;

    var data;

    if (useDirectQuery) {
        var filterConfigurations = (typeof filterConfigurationsRaw === 'string')
            ? JSON.parse(filterConfigurationsRaw || '[]')
            : (filterConfigurationsRaw || []);
        var adaptor = new sn_integration_use.TelemetryQueryAdaptor();
        var filterAnd = adaptor.buildFilterAnd(serviceName, metricName, startTime, filterConfigurations);

        var showOtherBool = (showOther === true || showOther === 'true');
        var sumProj = adaptor.buildSumProjection();
        var sumOrder = {}; sumOrder[sumProj.alias] = "desc";
        var appIdAlias = "StringAttributes__integration__application__id";
        var queryPayload = {
            "type": "telemetry_counter",
            "projection": [
                {"StringAttributes.integration.application.id": appIdAlias},
                sumProj
            ],
            "filter": {"$and": filterAnd},
            "group": [{"name": appIdAlias, "max_groups": numberOfGroups, "others": showOtherBool}],
            "order": [sumOrder]
        };

        var queryResult = adaptor.executeQuery(queryPayload) || {};
        var responses = adaptor.adaptResponse(queryResult);
        data = responses[0] || {};
    } else {
        var payload = {
            "dataConfigurations": [{
                "requestSourceType": "observability",
                "trendBy": "",
                "sourceType": "CUSTOM",
                "numberOfGroups": numberOfGroups,
                "sortBy": "VALUE",
                "sortOrder": "DESC",
                "filterElements": [],
                "includeForecast": false,
                "sortByRaw": "value",
                "aggregateBy": 4,
                "groupBy": ["StringAttributes__integration__application.id"],
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
                    dataType: "observability_data",
                    metric: "count",
                    aggregationColumn: "Count"
                },
                "disableRanges": false,
                "groupByDetails": [{
                    "disableRanges": false,
                    "numberOfGroupsBasedOn": null,
                    "numberOfGroups": String(numberOfGroups),
                    "showOther": showOther
                }],
                "type": "metrics",
                "dataCategory": "group",
                "startTime": startTime,
                "endTime": null,
                "showOther": true
            }],
            "filterConfigurations": filterConfigurationsRaw
        };

        var responses = new sn_telemetry_data.TelemetryDataHandler().getData(payload) || [];
        data = responses[0] || {};
    }

    // Data transformation
    if (data.response && data.response.data && Array.isArray(data.response.data)) {
        var rawData = data.response.data;
        var transformedData = [];
        var headers = rawData[0];

        for (var i = 1; i < rawData.length; i++) {
            var row = rawData[i];
            var transformedRow = {};

            var key = row[0];
            var value = row[1];
            if (!value) {
                continue;
            }

            if (key === "other") {
                transformedRow["application"] = "Other";
            } else {
                var oauthEntity = new GlideRecord("oauth_entity");
                if (oauthEntity.get(key)) {
                    var displayName = oauthEntity.getValue('name');
                    transformedRow["application"] = displayName;
                } else {
                    continue;
                }
            }

            if (metricName === 'http.inbound_api_integration.egress') {
                var bytes = parseFloat(value) || 0;
                value = parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2)).toString();
            }
            transformedRow["value"] = value;
            transformedData.push(transformedRow);
        }

        data.response.data = transformedData;
        if (data.response.metadata && data.response.metadata.groupBy) {
            var elements = data.response.metadata.groupBy[0].elements || [];
            var labels = {};
            var appIDArray = [];
            for (var j = 0; j < elements.length; j++) {
                appIDArray.push(elements[j].id);
            }
            if (appIDArray.length > 0) {
                var gr = new GlideRecord("oauth_entity");
                gr.addQuery('sys_id', 'IN', appIDArray.join(','));
                gr.query();
                while (gr.next()) {
                    labels[gr.getValue('sys_id')] = gr.getValue('name');
                }
            }
            for (var j = 0; j < appIDArray.length; j++) {
                if (appIDArray[j] === "other") {
                    elements[j].label = "Other";
                    elements[j].id = "Other";
                } else {
                    var labelValue = labels[appIDArray[j]];
                    if (labelValue) {
                        elements[j].label = labelValue;
                        elements[j].id = labelValue;
                        elements[j].eventData = {
                            ...elements[j].eventData,
                            sys_id: appIDArray[j]
                        };
                    }
                }
            }

            data.response.metadata.groupBy[0].id = "application";
            data.response.metadata.groupBy[0].label = "application";
        }
    }
    return [data.response];
}
