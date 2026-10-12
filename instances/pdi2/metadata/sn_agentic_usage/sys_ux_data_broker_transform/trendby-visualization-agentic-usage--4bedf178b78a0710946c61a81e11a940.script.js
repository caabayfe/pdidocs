function transform(input) {
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "sn.glide.action_fabric.record_action";
    var startTime = (input && input.startTime) || "P3M";
    var trendInterval = (input && input.trendInterval) || "1mon";
    var label = (input && input.label) || "Count";
    var groupByField = (input && input.groupBy) || "";

    var filterConfigurationsRaw = (input && input.filterConfigurations) || "[]";
    var filterConfigurations = (typeof filterConfigurationsRaw === 'string')
        ? JSON.parse(filterConfigurationsRaw || '[]')
        : (filterConfigurationsRaw || []);

    var adaptor = new sn_agentic_usage.TelemetryQueryAdaptorActionFabric();
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
            if (gv === "" || gv === "(empty)") continue; // don't chart a line for a blank group value
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
            if (gv === "" || gv === "(empty)") continue; // same exclusion, keep tsMap consistent with grou
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

    var data = {
        response: {
            data: responseData,
            metadata: directMetadata,
            filters: {appliedFilters: [], notAppliedFilters: []}
        }
    };

    if (data.response && data.response.data && Array.isArray(data.response.data)) {
        var rawData = data.response.data;
        var transformedData = [];
        var headers2 = rawData[0];

        for (var i = 1; i < rawData.length; i++) {
            var row = rawData[i];
            if (Array.isArray(row) && row.length >= 2) {
                var transformedRow = {};
                for (var j = 0; j < headers2.length && j < row.length; j++) {
                    transformedRow[headers2[j]] = row[j].toString();
                }
                transformedData.push(transformedRow);
            }
        }

        data.response.data = transformedData;
    }

    return [data.response];
}
