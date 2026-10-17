function transform(input) {
    const serviceName = (input && input.serviceName) || "glide";
    const metricName = (input && input.metricName) || "http.inbound_api_integration";
    const startTime = (input && input.startTime) || "P3M";
    const numberOfGroups = parseInt((input && input.numberOfGroups) || 10, 10);
    const groupBy = (input && input.groupBy) || "StringAttributes__integration__application__name";
    const additionalGroupBy = (input && input.additionalGroupBy) || "";
    const showOther = (input && input.showOther !== undefined) ? input.showOther : true;
    const filterConfigurationsRaw = (input && input.filterConfigurations) || [];
    const useDirectQuery = (input && input.useDirectQuery !== undefined)
        ? (input.useDirectQuery === true || input.useDirectQuery === 'true')
        : true;

    const groupByFields = [];
    if (groupBy) groupByFields.push(groupBy.trim());
    if (additionalGroupBy) groupByFields.push(additionalGroupBy.trim());

    var data;

    if (useDirectQuery) {
        var filterConfigurations = (typeof filterConfigurationsRaw === 'string')
            ? JSON.parse(filterConfigurationsRaw || '[]')
            : (filterConfigurationsRaw || []);
        var adaptor = new sn_integration_use.TelemetryQueryAdaptor();
        var filterAnd = adaptor.buildFilterAnd(serviceName, metricName, startTime, filterConfigurations);

        // Handles both input notations: "StringAttributes__x__y" and "StringAttributes.x.y".
        var primaryNorm = adaptor.normalizeField(groupBy);
        var primaryField = primaryNorm.source;
        var primaryFieldAlias = primaryNorm.alias;
        var additionalField = '';
        var additionalFieldAlias = '';
        if (additionalGroupBy) {
            var additionalNorm = adaptor.normalizeField(additionalGroupBy);
            additionalField = additionalNorm.source;
            additionalFieldAlias = additionalNorm.alias;
        }
        var showOtherBool = (showOther === true || showOther === 'true');

        var queryProjection = [];
        var queryGroup = [];
        var proj0 = {};
        proj0[primaryField] = primaryFieldAlias;
        queryProjection.push(proj0);
        queryGroup.push({"name": primaryFieldAlias, "max_groups": numberOfGroups, "others": showOtherBool});

        if (additionalField) {
            var proj1 = {};
            proj1[additionalField] = additionalFieldAlias;
            queryProjection.push(proj1);
            queryGroup.push(additionalField);
        }

        var sumProj = adaptor.buildSumProjection();
        var sumOrder = {}; sumOrder[sumProj.alias] = "desc";
        queryProjection.push(sumProj);

        var queryPayload = {
            "type": "telemetry_counter",
            "projection": queryProjection,
            "filter": {"$and": filterAnd},
            "group": queryGroup,
            "order": [sumOrder]
        };

        var queryResult = adaptor.executeQuery(queryPayload) || {};
        var responses = adaptor.adaptResponse(queryResult);
        data = responses[0] || {};
    } else {
        const payload = {
            dataConfigurations: [{
                requestSourceType: "observability",
                trendBy: "",
                numberOfGroups,
                sortBy: "VALUE",
                sortOrder: "DESC",
                aggregateBy: 4,
                groupBy: groupByFields,
                data: {
                    serviceName: {
                        key: `StringAttributes.${serviceName}`,
                        value: serviceName
                    },
                    metricName: {
                        key: `StringAttributes.${metricName}`,
                        value: metricName
                    },
                    metricType: "counter",
                    metricUnit: "1",
                    dataType: "observability_data",
                    metric: "count",
                    aggregationColumn: "Count"
                },
                type: "metrics",
                dataCategory: "group",
                startTime,
                endTime: null,
                showOther
            }],
            filterConfigurations: filterConfigurationsRaw
        };

        const responses = new sn_telemetry_data.TelemetryDataHandler().getData(payload) || [];
        data = responses[0] || {};
    }
    
    if (data.response && data.response.data && Array.isArray(data.response.data)) {
		var labels = {};
		if (data.response.metadata && data.response.metadata.groupBy) {
            var elements = (data.response.metadata.groupBy[1] && data.response.metadata.groupBy[1].elements) || [];
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
			for (j = 0; j < appIDArray.length; j++) {
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

		const rawData = data.response.data;
        const transformedData = [];
        const headers = rawData[0];

		for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (Array.isArray(row) && row.length >= 2) {
                const transformedRow = {};
                for (let j = 0; j < headers.length && j < row.length; j++) {
					var headerValue = row[j].toString();
                    if (metricName === 'http.inbound_api_integration.egress' && /^value\d*$/.test(headers[j])) {
                        var bytes = parseFloat(headerValue) || 0;
                        headerValue = parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2)).toString();
                    }
                    transformedRow[headers[j]] = headerValue;
                }

				var key = transformedRow[headers[1]]; // getting sys_id of application

				if (labels[key]) {
					transformedRow[headers[1]] = labels[key]; // replacing sys_id with application name
				}

                transformedData.push(transformedRow);
            }
        }
        
        data.response.data = transformedData;
    }
    
    return [data.response];
}
