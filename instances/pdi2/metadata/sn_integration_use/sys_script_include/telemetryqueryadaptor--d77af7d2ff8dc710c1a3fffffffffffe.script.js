var TelemetryQueryAdaptor = Class.create();
TelemetryQueryAdaptor.prototype = {
    initialize: function() {},

    /**
     * Convert an ISO 8601 duration string (P30D / P3M / P1Y) to absolute start/end strings.
     * Mirrors getData path: start = 00:00:00 of start date, end = 23:59:59 of today,
     * both in user's local timezone via setDisplayValueInternal (matches TelemetryUtils._formatDateWithTime + convertUserTZtoUTC).
     */
    getAbsoluteDateRange: function(isoDuration) {
        var endDt   = new GlideDateTime();
        var startDt = new GlideDateTime();
        var match   = isoDuration.match(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/);
        if (match) {
            var years  = parseInt(match[1] || 0, 10);
            var months = parseInt(match[2] || 0, 10);
            var days   = parseInt(match[3] || 0, 10);
            if (years)  startDt.addMonthsLocalTime(-(years * 12));
            if (months) startDt.addMonthsLocalTime(-months);
            if (days)   startDt.addDaysLocalTime(-days);
        }
        var startDateStr = startDt.getLocalDate().getValue() + ' 00:00:00';
        var endDateStr   = endDt.getLocalDate().getValue()   + ' 23:59:59';
        var startGdt = new GlideDateTime();
        startGdt.setDisplayValueInternal(startDateStr);
        var endGdt = new GlideDateTime();
        endGdt.setDisplayValueInternal(endDateStr);
        return {
            startTimeStr: startGdt.getValue(),
            endTimeStr:   endGdt.getValue()
        };
    },

    /**
     * Execute a query() call and return the result as native JS types.
     * payload must already be in the QueryServiceHttpClient doPost format.
     *
     * doDirectPost (used internally by query()) skips QueryServiceHttpClient._processResponse,
     * so the raw result contains Java Double/Long values instead of JS primitives.
     * JSON.parse(JSON.stringify()) normalises them, mirroring what _processResponse does.
     */
    executeQuery: function(payload) {
        var host = gs.getProperty('glide.appsee.queryservice.api_host', 'https://valk-prod-queryservice:9443/');
        gs.info('TelemetryQueryAdaptor.executeQuery - host: ' + host + ' | payload: ' + JSON.stringify(payload));
        try {
            // Pre-stringify payload so doDirectPost sends {query: "json-string"} — identical to how
            // doPost._addParamsToPayload works. Without this, Java coerces JS integers (e.g. max_groups: 19)
            // to Java Doubles (19.0), causing Valk to reject them as "not an integer".
            var result = (new sn_telemetry_data.TelemetryDataHandler()).query({
                url:     '/telemetry/query',
                payload: {query: JSON.stringify(payload)},
                source:  'Inbound API Dashboard'
            });
            if (!result) return null;
            // doDirectPost returns a raw string; JSON.stringify would escape it instead of normalising Java types.
            var str = (typeof result === 'string') ? result : JSON.stringify(result);
            // Mirrors QueryServiceHttpClient._processResponse: NaN is not valid JSON and must be replaced before parsing.
            str = str.replaceAll(NaN, '0') || str;
            try {
                return JSON.parse(str);
            } catch (ex) {
                var errorPattern = /Status\s(\d+)\s-\s\[(.+?)\](?:\s\[\{\s?"Error":\s?"(.+?)"\s?\}\])?/;
                var match = str.match(errorPattern);
                var errorResponse = {detail: str};
                if (match) {
                    errorResponse.statusCode = match[1];
                    errorResponse.message = match[2];
                }
                gs.error('TelemetryQueryAdaptor.executeQuery - failed to parse response: ' + str);
                throw errorResponse;
            }
        } catch (ex) {
            gs.error('TelemetryQueryAdaptor.executeQuery - error: ' + (ex.message || ex.detail || JSON.stringify(ex)));
            throw ex;
        }
    },

    /**
     * Adapt the raw query() response {columns, rows, rollup} into the getData() response shape:
     *   [{order, response: {data: [[headers], [row]...], filters, metadata: {groupBy, series, format}}}]
     *
     * Mirrors GroupResponseTransformer exactly so downstream data broker transformation
     * code that was written for getData() continues to work unchanged.
     *
     * @param {Object} queryResult  - raw response from executeQuery()
     * @param {Number} order        - order index (default 0)
     * @returns {Array}             - same shape as getData() responses array
     */
    adaptResponse: function(queryResult, order) {
        order = order || 0;

        if (!queryResult || !queryResult.columns || !queryResult.rows) {
            return [];
        }

        var qCols        = queryResult.columns;
        var qRows        = queryResult.rows;
        var numGroupCols = qCols.length - 1; // all columns except last are group columns
        var lastColName  = qCols[qCols.length - 1][0];

        // Build header row: __ → dot-notation for group columns, last column → "value"
        // Mirrors GroupResponseTransformer._getData() + telemetryUtils.transformAttribute()
        var headerRow = [];
        for (var c = 0; c < qCols.length; c++) {
            var colName = qCols[c][0];
            headerRow.push(c === qCols.length - 1 ? 'value' : colName.replace(/__/g, '.'));
        }

        // data[0] = header row; data[1..n] = value rows
        // Per-column element tracking: deduplicated and order-preserving.
        // Mirrors GroupResponseTransformer._getGroupByValues() which uses Set per column.
        var adaptedData  = [headerRow];
        var elementSets  = []; // one {} per group column — tracks seen values for dedup
        var elementLists = []; // one [] per group column — preserves insertion order
        for (var g = 0; g < numGroupCols; g++) {
            elementSets.push({});
            elementLists.push([]);
        }

        for (var r = 0; r < qRows.length; r++) {
            var row     = qRows[r];
            var dataRow = row.slice(0, -1);
            var val     = row[row.length - 1];
            dataRow.push(Array.isArray(val) ? val[0] : val);
            adaptedData.push(dataRow);

            for (var g = 0; g < numGroupCols; g++) {
                var elemVal = row[g] ? String(row[g]) : '(empty)';
                if (!elementSets[g][elemVal]) {
                    elementSets[g][elemVal] = true;
                    elementLists[g].push(elemVal);
                }
            }
        }

        // Build groupBy metadata for each group column.
        // Mirrors GroupResponseTransformer._getGroupByMetadata().
        var groupByMetadata = [];
        for (var g = 0; g < numGroupCols; g++) {
            var groupColName     = qCols[g][0];
            var groupSanitized   = this._sanitizeColumnName(groupColName);
            var groupTransformed = groupColName.replace(/__/g, '.');
            var elements = [];
            for (var e = 0; e < elementLists[g].length; e++) {
                var ev = elementLists[g][e];
                elements.push({id: ev, label: ev, eventData: {}});
            }
            groupByMetadata.push({
                fieldType: 'string',
                id:        groupTransformed,
                label:     groupSanitized,
                series:    [{id: 'value', label: groupSanitized, type: 'value'}],
                elements:  elements
            });
        }

        var seriesLabel = this._sanitizeColumnName(lastColName);

        return [{
            order: order,
            response: {
                data: adaptedData,
                filters: {appliedFilters: [], notAppliedFilters: []},
                metadata: {
                    groupBy:     groupByMetadata,
                    series:      [{id: 'value', label: seriesLabel, type: 'value'}],
                    format:      {frequency: 'daily', unitFormat: '{0}', precision: 0},
                    aggregateBy: 0,
                    timeZone:    'SESSION'
                }
            }
        }];
    },

    /**
     * Build the base $and filter array for a standard counter query.
     * Handles both TABLE (via TABLE_FILTER_MAP) and OBSERVABILITY (via applyTo.payload)
     * CHOICE filters from filterConfigurations.
     *
     * @param {string} serviceName          - metric service name
     * @param {string} metricName           - metric name
     * @param {string} startTime            - ISO 8601 duration (P1M, P3M, P6M)
     * @param {Array}  filterConfigurations - parsed array of filter config objects
     * @returns {Array} filterAnd ready for {"$and": filterAnd}
     */
    buildFilterAnd: function(serviceName, metricName, startTime, filterConfigurations) {
        var dateRange = this.getAbsoluteDateRange(startTime);
        return this.buildFilterAndFromRange(serviceName, metricName, dateRange.startTimeStr, dateRange.endTimeStr, filterConfigurations);
    },

    /**
     * Core filter builder — takes pre-computed absolute time strings.
     * Use this when the caller has already resolved startTimeStr/endTimeStr
     * (e.g. when an absolute endTime is provided alongside an ISO-duration startTime).
     *
     * @param {string} serviceName          - metric service name
     * @param {string} metricName           - metric name
     * @param {string} startTimeStr         - absolute UTC start "YYYY-MM-DD HH:MM:SS"
     * @param {string} endTimeStr           - absolute UTC end "YYYY-MM-DD HH:MM:SS"
     * @param {Array}  filterConfigurations - parsed array of filter config objects
     * @returns {Array} filterAnd ready for {"$and": filterAnd}
     */
    buildFilterAndFromRange: function(serviceName, metricName, startTimeStr, endTimeStr, filterConfigurations) {
        var filterAnd = [
            {"ServiceName": {"$eq": serviceName}},
            {"MetricName": {"$eq": metricName}},
            {"StartTime": {"$gte": startTimeStr}},
            {"StartTime": {"$lte": endTimeStr}}
        ];
        var TABLE_FILTER_MAP = {
            'oauth_entity.sys_id': 'StringAttributes.integration.application.id',
            'sys_user.sys_id':     'StringAttributes.integration.user.sys_id'
        };
        for (var fi = 0; fi < filterConfigurations.length; fi++) {
            var fc = filterConfigurations[fi];
            if (fc && fc.type && fc.type.toUpperCase() === 'CHOICE' &&
                fc.apply_to && fc.apply_to[0] && fc.values && fc.values.length > 0) {
                var applyTo = fc.apply_to[0];
                if (applyTo.type && applyTo.type.toUpperCase() === 'TABLE' && applyTo.key) {
                    var chColumn = TABLE_FILTER_MAP[applyTo.key];
                    if (chColumn) {
                        var fo = {};
                        fo[chColumn] = {"$in": fc.values};
                        filterAnd.push(fo);
                    }
                } else if (applyTo.payload) {
                    var observabilityKey = applyTo.payload[applyTo.payload.observability || 'observability'];
                    for (var fk in applyTo.payload) {
                        if (fk !== 'observability' && fk !== observabilityKey) {
                            var obsFilter = {};
                            obsFilter[fk] = {"$eq": applyTo.payload[fk]};
                            filterAnd.push(obsFilter);
                        }
                    }
                    var obsKeyFilter = {};
                    obsKeyFilter[observabilityKey] = {"$in": fc.values};
                    filterAnd.push(obsKeyFilter);
                }
            }
        }
        return filterAnd;
    },

    /**
     * Mirrors GroupResponseTransformer._sanitizeColumnName():
     * "StringAttributes__integration__user__sys_id" → "Integration User Sys Id"
     * "Total_1" → "Total 1"
     */
    _sanitizeColumnName: function(colName) {
        if (!colName) return '';
        return colName
            .replace(/^[^_]*__/, '')
            .replace(/__/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    },

    /**
     * Normalise a groupBy field name to both forms needed for a direct query projection.
     * Mirrors getData's transformAttribute (normalise to dot) + sanitizeColumnAlias (dot → __).
     * Accepts either "StringAttributes.x.y" or "StringAttributes__x__y" (or mixed) as input.
     *
     * @param {string} field - field name in any notation
     * @returns {{ source: string, alias: string }}
     *   source: dot notation   → use as ClickHouse projection source key and plain group string
     *   alias:  __ notation    → use as projection alias value and group "name"
     */
    normalizeField: function(field) {
        var source = field.trim().replace(/__/g, '.');
        var alias  = source.replace(/\./g, '__');
        return { source: source, alias: alias };
    },

    /**
     * Mirrors GenericConfigDSLAdaptor._addAggregates alias logic:
     * sanitizeColumnAlias(column) replaces dots→__, strips DISTINCT/brackets/spaces.
     * If the resulting alias equals the source column name, appends '_1' to avoid collision.
     * For the standard "Total" counter column: sanitizeColumnAlias("Total") → "Total" (unchanged)
     * → alias == column → "Total_1".
     *
     * Usage: queryProjection.push(adaptor.buildSumProjection());
     *        "order": [{ [adaptor.buildSumProjection().alias]: "desc" }]
     * or store: var sumProj = adaptor.buildSumProjection(); ... sumProj.alias for order.
     *
     * @param {string} [column="Total"] - the ClickHouse column to sum
     * @returns {{ "$sum": string, "alias": string }}
     */
    buildSumProjection: function(column) {
        column = column || "Total";
        var alias = column
            .replace(/\./g, '__')
            .replace(/^DISTINCT\s+/i, '')
            .replace(/\['/g, '__')
            .replace(/'\]/g, '')
            .replace(/\s/g, '');
        if (alias === column) alias = alias + '_1';
        return {"$sum": column, "alias": alias};
    },

    type: 'TelemetryQueryAdaptor'
};
