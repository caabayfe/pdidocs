function transform(input) {
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "http.inbound_api_integration";
    var startTime = (input && input.startTime) || "P3M";
    var numberOfGroupsRaw = (input && input.numberOfGroups) || 10;
    var numberOfGroups = parseInt(numberOfGroupsRaw, 10);
    var showOther = (input && input.showOther !== undefined) ? input.showOther : true;
    var groupByFields = ["StringAttributes__integration__user__sys_id"];
    var filterConfigurations = (input && input.filterConfigurations) || "[]";

    var adaptor = new sn_integration_use.TelemetryQueryAdaptor();
    var useDirectQuery = (input && input.useDirectQuery !== undefined)
        ? (input.useDirectQuery === true || input.useDirectQuery === 'true')
        : true;

    var projectionGroupBy = {};
    projectionGroupBy["StringAttributes.integration.user.sys_id"] = "StringAttributes__integration__user__sys_id";

    var data;
    if (useDirectQuery) {
        // ---- /telemetry/query path (direct)
        var parsedFilterConfigurations = (typeof filterConfigurations === 'string')
            ? JSON.parse(filterConfigurations || '[]')
            : (filterConfigurations || []);
        var filterAnd = adaptor.buildFilterAnd(serviceName, metricName, startTime, parsedFilterConfigurations);

        var showOtherBool = (showOther === true || showOther === 'true');
        var sumProj = adaptor.buildSumProjection();
        var sumOrder = {}; sumOrder[sumProj.alias] = "desc";
        var payload = {
            "projection": [
                projectionGroupBy,
                sumProj
            ],
            "type": "telemetry_counter",
            "group": [{"name": groupByFields[0], "others": showOtherBool, "max_groups": numberOfGroups}],
            "filter": {"$and": filterAnd},
            "order": [sumOrder]
        };

        var queryResult = adaptor.executeQuery(payload);
        var responses   = adaptor.adaptResponse(queryResult, 0);
        data = responses[0] || {};
    } else {
        // ---- getData path (original implementation from before executeQuery migration)
        var responses = new sn_telemetry_data.TelemetryDataHandler().getData({
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
                "groupBy": groupByFields,
                "data": {
                    "serviceName": {"key": "StringAttributes." + serviceName, "value": serviceName},
                    "metricName": {"key": "StringAttributes." + metricName, "value": metricName},
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
            "filterConfigurations": filterConfigurations
        }) || [];
        data = responses[0] || {};
    }

    // Data transformation (unchanged)
    if (data.response && data.response.data && Array.isArray(data.response.data)) {
        var rawData = data.response.data;
        var transformedData = [];

        for (var i = 0; i < rawData.length; i++) {
            var row = rawData[i];
            var transformedRow = {};

            var key = row["StringAttributes.integration.user.sys_id"];
            if (!key) {
                key = row[Object.keys(row)[0]];
            }

            var value = row["value"] || row[Object.keys(row)[1]];
            if (!value) {
                continue;
            }

            if (key === "other") {
                transformedRow["user"] = "Other";
            } else {
                var grUser = new GlideRecord("sys_user");
                if (grUser.get(key)) {
                   var displayName = grUser.getValue("user_name");
                    transformedRow["user"] = displayName;
                } else {
                    continue;
                }
            }

            transformedRow["value"] = value;
            transformedData.push(transformedRow);
        }

        data.response.data = transformedData;

        if (data.response.metadata && data.response.metadata.groupBy) {
            var elements = data.response.metadata.groupBy[0].elements || [];
            var labels = {};
			 var userIDsArray = [];
            for (var j = 0; j < elements.length; j++) {
                userIDsArray.push(elements[j].id);
            }
            var gr = new GlideRecord("sys_user");
            gr.addQuery('sys_id', 'IN', userIDsArray.join(','));
            gr.query();
            while (gr.next()) {
                var id = gr.getValue('sys_id');
                labels[id] = gr.getValue('user_name');
            }
            for (var j = 0; j < userIDsArray.length; j++) {
                if (userIDsArray[j] === "other") {
                    elements[j].label = "Other";
                    elements[j].id = "Other";
                } else {
                   var labelValue =labels[userIDsArray[j]];
                    elements[j].label = labelValue;
                    elements[j].id = labels[userIDsArray[j]];
                    elements[j].eventData = {
                        ...elements[j].eventData,
                        sys_id: userIDsArray[j]
                    };
                }

            }

            data.response.metadata.groupBy[0].id = "user";
            data.response.metadata.groupBy[0].label = "User";
        }
    }
    return [data.response];
}
