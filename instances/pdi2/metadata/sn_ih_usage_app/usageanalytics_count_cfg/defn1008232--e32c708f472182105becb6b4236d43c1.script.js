var SOURCE_TABLE = 'data_egress_count';
var AGGREGATE_COLUMN = 'aggregation_value';
var AGGREGATE_OP = 'SUM';
var GROUP_BY_COLUMN = 'agg_period';
var RATIO = 1000000;
var DATA_EGRESS_DEBUG_PROPERTY = 'glide.data_egress.debug';

function debugLog(message) {
    if (gs.getProperty(DATA_EGRESS_DEBUG_PROPERTY) == 'true') {
        gs.debug(message);
    }
}

function logStats(aggregateStr, adjustedNum, hasError, errorMessage) {
    try {
        var logData = {
            'error': hasError || false,
            'errorMessage': errorMessage || '',
            'volume': aggregateStr || '',
            'adjusted': adjustedNum,
            'start': gs.beginningOfLast30Days() || '',
            'end': gs.endOfLast30Days() || ''
        };

        gs.info('DataEgress - Egress info: ' + JSON.stringify(logData));
    } catch (e) {
        gs.warn('DataEgress - Failed to generate debug object: ' + e);
    }
}

answer = (function() {
    var ga = new GlideAggregate(SOURCE_TABLE);

    // in the past 30 days, query for the day when sum of egress is highest
    ga.addEncodedQuery('sys_created_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()');
    ga.addAggregate(AGGREGATE_OP, AGGREGATE_COLUMN);
    ga.orderByAggregate(AGGREGATE_OP, AGGREGATE_COLUMN);
    ga.groupBy(GROUP_BY_COLUMN);
    ga.query();

    // no eligible egress traffic found
    if (!ga.next()) {
        debugLog('DataEgress - No record found');
        logStats('Not found', 0, false);
        return 0;
    }

    var maxValueStr = ga.getAggregate(AGGREGATE_OP, AGGREGATE_COLUMN);

    // invalid aggregate value
    if (maxValueStr == null) {
        gs.error('DataEgress - Null aggregated value');
        logStats('null', 0, true, 'Null aggregated value');
        return 0;
    }

    var maxValueNum = Number(maxValueStr);

    if (isNaN(maxValueNum)) {
        gs.error('DataEgress - Invalid aggregated value: ' + maxValueStr);
        logStats(maxValueStr, 0, true, 'Invalid aggregated value');
        return 0;
    }

    var hasError = false;
    var errorMessage = '';

    // egress value exceeds max javascript integer value
    if (maxValueNum > Number.MAX_SAFE_INTEGER) {
        gs.warn('DataEgress - Egress volume exceeds safe parameters: ' + maxValueStr);
        maxValueNum = Number.MAX_SAFE_INTEGER;
        hasError = true;
        errorMessage = 'Egress volume exceeds safe parameters';
    }

    var scaledMaxValue = Math.floor(maxValueNum / RATIO);

    logStats(maxValueStr, scaledMaxValue, hasError, errorMessage);

    // Set answer instead of logging for actual DEFN
    return scaledMaxValue;
})();
