function transform(input) {
    // ---- Helpers
    function toInt(val, def) {
        var n = parseInt(val, 10);
        return isNaN(n) ? def : n;
    }

    function parseJSONSafe(val, def) {
        if (!val) return def;
        if (typeof val === 'object') return val;
        try {
            return JSON.parse(val);
        } catch (e) {
            return def;
        }
    }

    function formatCellValue(value, type) {
        if (type === 'boolean') return value ? 'Yes' : 'No';
        return value;
    }

    function cell(val, label) {
        if (typeof val === 'number') return { key: val, value: val };
        if (typeof val === 'boolean') return { key: val, value: val };
        var s = (val == null) ? '' : String(val);
        var obj = { key: s, value: s };
        if (label) obj.label = label;
        return obj;
    }

    // ---- Extract inputs based on defined props
    var serviceName = (input && input.serviceName) || 'glide';
    var metricName = (input && input.metricName) || 'sn.glide.action_fabric.record_action';
    var startTime = (input && input.startTime) || 'P3M';
    var endTime = (input && input.endTime) || null;
    var groupByField = (input && input.groupBy) || '';
    var groupByFields = groupByField ? groupByField.split(',').map(function(s) { return s.trim(); }) : [];
    var pageSize = toInt(input && input.pageSize, 10);
    var pageNumber = toInt(input && input.pageNumber, 1);
    var predicateComposition = (input && input.predicateComposition) || {};

    // Projections: configurable via input or use default
    var projections = parseJSONSafe(input && input.projections, null);
    if (!projections || !Array.isArray(projections) || projections.length === 0) {
        // Default projections
        projections = [
            { key: 'StringAttributes.sn.glide.action_fabric.integration_client', label: 'Client', type: 'string' },
            { key: 'Total', label: 'Count', type: 'string' }
        ];
    }

    // Filters can be an array or a JSON string
    var filterConfigurations = parseJSONSafe(input && input.filterConfigurations, []);
    var adaptor = new sn_agentic_usage.TelemetryQueryAdaptorActionFabric();

    // UI sends times in local timezone — convert to UTC. getAbsoluteDateRange already returns UTC.
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
        endTimeStr   = dateRange.endTimeStr;
    }

    var queryProjections = projections
        .filter(function(p) { return !(groupByFields.length > 0 && p.key === 'Total'); })
        .map(function(p) {
            var proj = {};
            proj[p.key] = p.label;
            return proj;
        });
    var sumProj = adaptor.buildSumProjection();
    var sumOrder;
    if (groupByFields.length > 0) {
        queryProjections.push(sumProj);
        sumOrder = {}; sumOrder[sumProj.alias] = "desc";
    } else {
        sumOrder = {"Total": "desc"};
    }

    var filterAnd = adaptor.buildFilterAndFromRange(serviceName, metricName, startTimeStr, endTimeStr, filterConfigurations);
    if (predicateComposition && predicateComposition.predicate &&
        Array.isArray(predicateComposition.predicate.predicates) &&
        predicateComposition.predicate.predicates.length > 0) {
        var predicateFilters = predicateComposition.predicate.predicates.map(function(p) {
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
        "projection": queryProjections,
        "filter": {"$and": filterAnd},
        "order": [sumOrder],
        "paging": {"limit": pageSize, "skip": (pageNumber - 1) * pageSize}
    };
    if (groupByFields.length > 1) {
        payload.group = groupByFields;
    } else if (groupByFields.length === 1) {
        payload.group = [{"name": groupByFields[0], "max_groups": pageSize}];
    }

    var data = adaptor.executeQuery(payload) || {};

    // ---- Table output from projections
    function buildColumns(dataColumns) {
        var cols = [];
        if (!dataColumns) return cols;
        for (var i = 0; i < dataColumns.length; i++) {
            var p = dataColumns[i];
            var keyname = p[0];
            if (keyname == 'Total_1' || keyname == 'Total') {
                keyname = 'Total';
            } else if (keyname == 'StartTime') {
                keyname = 'Time';
            }
            cols.push({
                format: null,
                key: p[0],
                label: keyname,
                type: 'string'
            });
        }
        return cols;
    }

    function buildRows(fromData, usingProjections) {
        var rows = [];
        if (!fromData || !Array.isArray(fromData.rows)) return rows;
        var returnedRows = fromData.rows;
        returnedRows = returnedRows.sort((a, b) => {
            const lastValueA = a[a.length - 1];
            const lastValueB = b[b.length - 1];
            return lastValueB - lastValueA; // For descending order
        });

        for (var i = 0; i < returnedRows.length; i++) {
            var r = returnedRows[i];
            var rowCells = {};
            for (var j = 0; j < usingProjections.length; j++) {
                var p = usingProjections[j];
                var colKey = p.key;
                var cellValue = formatCellValue(r[j], p.type);
                rowCells[colKey] = cell(cellValue);
            }
            rows.push({
                key: 'rowKey' + i,
                cells: rowCells
            });
        }
        return rows;
    }

    var columns = buildColumns(data.columns);
    if (data.rows && data.rows.length > 0) {
        var rows = buildRows(data, columns);
        return {
            columnDefinitions: {
                columns: columns
            },
            rowDefinitions: {
                rows: rows,
                selectionEnabled: false,
                cellEditingEnabled: false
            }
        };
    } else {
        return {
            columnDefinitions: {
                columns: [{
                    key: 'message',
                    label: '',
                    type: 'html'
                }]
            },
            rowDefinitions: {
                rows: [{
                    key: 'noDataRow',
                    cells: {
                        message: {
                            key: 'No data',
                            value: "No data found"
                        }
                    }
                }]
            }
        };
    }
}
