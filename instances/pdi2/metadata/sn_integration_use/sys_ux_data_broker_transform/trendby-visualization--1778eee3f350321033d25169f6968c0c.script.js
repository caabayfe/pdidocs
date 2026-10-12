function transform(input) {
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "http.inbound_api_integration";
    var startTime = (input && input.startTime) || "P3M";
    var trendInterval = (input && input.trendInterval) || "1mon";
    var trendBy = (input && input.trendBy) || "";
    var metric = (input && input.metric) || "count";
    var label = (input && input.label) || "Count";
    var numberOfGroupsRaw = (input && input.numberOfGroups) || 10;
    var numberOfGroups = parseInt(numberOfGroupsRaw, 10);
    var groupByField = (input && input.groupBy) || "";

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

        var queryProjection = [{"StartTime": "StartTime"}];
        var queryGroup = ["StartTime"];

        if (groupByField) {
            var gbField = adaptor.normalizeField(groupByField);
            var gbProj = {};
            gbProj[gbField.source] = gbField.alias;
            queryProjection.push(gbProj);
            queryGroup.push(gbField.source);
        }

        queryProjection.push(adaptor.buildSumProjection());

        var queryPayload = {
            "type": {"telemetry_counter": {"rollup": trendInterval}},
            "projection": queryProjection,
            "filter": {"$and": filterAnd},
            "group": queryGroup,
            "order": [{"StartTime": "asc"}]
        };

        var queryResult = adaptor.executeQuery(queryPayload) || {};
        var rawRows = queryResult.rows || [];

        function dateToMs(dateTimeStr) {
            var gdt = new GlideDateTime();
            gdt.setValue(dateTimeStr);
            return gdt.getNumericValue();
        }

        // Build the full ordered list of UTC-aligned bucket timestamps for the date range.
        // Valk only returns non-zero rows; iterating allBuckets lets us pad missing ones with 0.
        var dateRange = adaptor.getAbsoluteDateRange(startTime);
        var rangeStartGdt = new GlideDateTime();
        rangeStartGdt.setValue(dateRange.startTimeStr);
        var rangeEndGdt = new GlideDateTime();
        rangeEndGdt.setValue(dateRange.endTimeStr);
        var rangeEndMs = rangeEndGdt.getNumericValue();

        var allBuckets = [];
        if (trendInterval === '1mon') {
            // Monthly: first-of-month UTC midnight for each month in range
            var startUtcStr = rangeStartGdt.getValue();
            var bYear  = parseInt(startUtcStr.substring(0, 4), 10);
            var bMonth = parseInt(startUtcStr.substring(5, 7), 10);
            while (true) {
                var mm = bMonth < 10 ? '0' + bMonth : '' + bMonth;
                var bucketGdt = new GlideDateTime();
                bucketGdt.setValue(bYear + '-' + mm + '-01 00:00:00');
                var bucketMs = bucketGdt.getNumericValue();
                if (bucketMs > rangeEndMs) break;
                allBuckets.push(bucketMs.toString());
                bMonth++;
                if (bMonth > 12) { bMonth = 1; bYear++; }
            }
        } else {
            // Hourly / daily / weekly: fixed ms interval, aligned to UTC boundary
            var intervalMs = trendInterval === '1h' ? 3600000
                           : trendInterval === '1w' ? 7 * 86400000
                           : 86400000; // '1d' or default
            var curMs = rangeStartGdt.getNumericValue();
            curMs = Math.floor(curMs / intervalMs) * intervalMs;
            while (curMs <= rangeEndMs) {
                allBuckets.push(curMs.toString());
                curMs += intervalMs;
            }
        }

        var responseData;
        var metadataGroupBy = null;
        var topSeries = null;

        if (!groupByField) {
            // Build value lookup from Valk rows, then emit full padded grid
            var valMap = {};
            for (var r = 0; r < rawRows.length; r++) {
                valMap[dateToMs(rawRows[r][0]).toString()] = rawRows[r][1];
            }
            responseData = [["timestamp", "value"]];
            for (var b = 0; b < allBuckets.length; b++) {
                var bMs = allBuckets[b];
                responseData.push([bMs, valMap[bMs] !== undefined ? valMap[bMs] : 0]);
            }
        } else {
            // Collect unique group values in first-seen order
            var groupOrder = [];
            var groupSet = {};
            for (var r = 0; r < rawRows.length; r++) {
                var gv = String(rawRows[r][1]);
                if (!groupSet[gv]) {
                    groupSet[gv] = true;
                    groupOrder.push(gv);
                }
            }

            var headers = ["timestamp"];
            var elements = [];
            for (var g = 0; g < groupOrder.length; g++) {
                headers.push("value" + g);
                elements.push({id: groupOrder[g], label: groupOrder[g],
                    series: [{id: "value" + g, type: "value", label: groupOrder[g]}]});
            }
            responseData = [headers];

            // Pivot Valk rows into tsMap, then emit full padded grid
            var tsMap = {};
            for (var r = 0; r < rawRows.length; r++) {
                var tsMs = dateToMs(rawRows[r][0]).toString();
                var gv = String(rawRows[r][1]);
                var val = rawRows[r][2];
                if (!tsMap[tsMs]) { tsMap[tsMs] = {}; }
                tsMap[tsMs][gv] = val;
            }
            for (var t = 0; t < allBuckets.length; t++) {
                var ts = allBuckets[t];
                var dataRow = [ts];
                for (var g = 0; g < groupOrder.length; g++) {
                    var v = tsMap[ts] ? tsMap[ts][groupOrder[g]] : undefined;
                    dataRow.push(v !== undefined ? v : 0);
                }
                responseData.push(dataRow);
            }

            metadataGroupBy = [{fieldType: 'string', id: groupByField, label: groupByField, elements: elements}];
            topSeries = [];
            for (var sg = 0; sg < groupOrder.length; sg++) {
                topSeries.push({id: 'value' + sg, label: groupOrder[sg], type: 'value'});
            }
        }

        var trendFrequency = (trendInterval === '1mon') ? 'monthly' : 'daily';
        var directMetadata = {
            aggregateBy: 0,
            format:      {frequency: trendFrequency, unitFormat: '{0}'},
            timeZone:    'SESSION',
            trendBy:     {fieldType: 'glide_date_time', id: 'start_time', label: 'Start Time'}
        };
        if (metadataGroupBy) {
            directMetadata.groupBy = metadataGroupBy;
            directMetadata.series  = topSeries;
        } else {
            directMetadata.series = [{id: 'value', label: label, type: 'value'}];
        }

        data = {
            response: {
                data: responseData,
                metadata: directMetadata,
                filters: {appliedFilters: [], notAppliedFilters: []}
            }
        };
    } else {
        var dataConfiguration = {
            requestSourceType: "observability",
            trendBy: trendBy,
            sourceType: "CUSTOM",
            sortBy: "VALUE",
            sortOrder: "DESC",
            filterElements: [],
            aggregateBy: 4,
            data: {
                serviceName: {
                    key: "StringAttributes." + serviceName,
                    value: serviceName
                },
                metricName: {
                    key: "StringAttributes." + metricName,
                    value: metricName
                },
                metricType: "counter",
                metricUnit: "1",
                dataType: "observability_data",
                metric: metric,
                label: label,
                aggregationColumn: "count",
                predicateComposition: ""
            },
            type: "metrics",
            dataCategory: "trend",
            startTime: startTime,
            trendInterval: trendInterval,
            selectedMetricType: "basic-stats",
            endTime: null,
            metric: metric,
            label: label
        };

        if (groupByField) {
            dataConfiguration.groupBy = [groupByField];
            dataConfiguration.numberOfGroups = numberOfGroups;
            dataConfiguration.showOther = false;
            dataConfiguration.disableRanges = false;
        }

        var payload = {
            dataConfigurations: [dataConfiguration],
            filterConfigurations: filterConfigurationsRaw
        };

        var responses = new sn_telemetry_data.TelemetryDataHandler().getData(payload) || [];
        data = responses[0] || {};
    }

    if (data.response && data.response.data && Array.isArray(data.response.data)) {
        var rawData = data.response.data;
        var transformedData = [];
        var headers = rawData[0];

        for (var i = 1; i < rawData.length; i++) {
            var row = rawData[i];
            if (Array.isArray(row) && row.length >= 2) {
                var transformedRow = {};

                for (var j = 0; j < headers.length && j < row.length; j++) {
                    var header = headers[j];
                    var value = row[j].toString();

                    if (header === "StringAttributes.integration.user.sys_id") {
                        var grUser = new GlideRecord("sys_user");
                        if (grUser.get(value)) {
                            header = "StringAttributes.integration.user.name";
                            value = grUser.getValue("user_name");
                        }
                    }

                    if (metricName === 'http.inbound_api_integration.egress' && /^value\d*$/.test(header)) {
                        var bytes = parseFloat(value) || 0;
                        value = trendInterval === '1mon'
                            ? parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2)).toString()
                            : parseFloat((bytes / (1024 * 1024)).toFixed(2)).toString();
                    }

                    transformedRow[header] = value;
                }

                transformedData.push(transformedRow);
            }
        }

        data.response.data = transformedData;
    }


    if (data.response && data.response.metadata && data.response.metadata.groupBy) {
        var elements = data.response.metadata.groupBy[0].elements || [];

        if (elements.length === 0) {
            return [data.response];
        }

        var isDomain = groupByField.toLowerCase().includes('domain');

        // Configuration map for different groupBy types
        var tableConfig = {
            'domain': { table: 'domain', labelField: 'name' },
            'default': { table: 'sys_user', labelField: 'user_name' }
        };

        var config = isDomain ? tableConfig.domain : tableConfig.default;

        var sysIdsArr = [];
        var labels = {};

        // Pre-populate known special domain IDs to avoid unnecessary DB lookup
        if (isDomain) {
            labels['0'] = 'global';
            labels[''] = 'global';
        }

        for (var i = 0; i < elements.length; i++) {
            var id = elements[i].id;
            if (id !== 'other' && id !== 'Other') {
                // '0' and '' already resolved above; skip DB lookup for them
                if (isDomain && (id === '0' || id === '')) continue;
                sysIdsArr.push(id);
            }
        }

        if (sysIdsArr.length > 0) {
            var gr = new GlideRecord(config.table);
            gr.addQuery('sys_id', 'IN', sysIdsArr.join(','));
            gr.query();

            while (gr.next()) {
                labels[gr.getValue('sys_id')] = gr.getValue(config.labelField);
            }
        }

        // Update elements with labels
        for (var j = 0; j < elements.length; j++) {
            var element = elements[j];
            if (element.id === 'other' || element.id === 'Other') {
                element.label = 'Other';
                element.id = 'Other';
            } else {
                var label = labels[element.id];
                if (label) {
                    element.eventData = element.eventData || {};
                    element.eventData.sys_id = element.id;
                    element.label = label;
                    element.id = label;
                }
            }
        }

        data.response.metadata.groupBy[0].id = "user";
        data.response.metadata.groupBy[0].label = "User";
    }

    return [data.response];
}
