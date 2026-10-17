var TelemetryConstants = Class.create();
TelemetryConstants.prototype = {
    initialize: function() {},

    type: 'TelemetryConstants'
};

// Aggregate Function Constants
TelemetryConstants.AGGREGATE_FUNCTIONS = {
    SUM: 'sum',
    MIN: 'min',
    MAX: 'max',
    AVERAGE: 'average',
    COUNT: 'count',
    MEDIAN: 'median',
    HISTOGRAMQUANTILES: 'histogramquantiles',
    DISTINCT_COUNT: 'distinct_count',
    UNIQ: 'uniq',
    RECORDCOUNT: 'recordcount'
};
TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING = {
    D: 'day',
    W: 'week',
    M: 'month',
    Y: 'year'
};
TelemetryConstants.ISO86_DATE_INTERVAL_REGEX = '^P([0-9]+)([D,W,Y,M]$)';
TelemetryConstants.Telemetry_TYPES = [
    "observability_metadata_service", "observability_metadata"
];
TelemetryConstants.AGGREGATE_COLUMNS = {
    COUNT: 'Count',
};
TelemetryConstants.DEFAULT_RELATIVE_ACCURACY = gs.getProperty('sn_telemetry_data.relative_accuracy', 0.01);
TelemetryConstants.DEFAULT_NUMBER_OF_GROUPS = gs.getProperty('sn_telemetry_data.default_number_of_groups', 10);
TelemetryConstants.DEFAULT_NUMBER_OF_RECORDS = gs.getProperty('sn_telemetry_data.default_number_of_records', 10000);
TelemetryConstants.DATA_CATEGORY = {
    TREND: "trend",
    SIMPLE: "simple",
    LIST: "list"
};
TelemetryConstants.VALUE = 'value';
TelemetryConstants.TIMESTAMP = 'timestamp';
TelemetryConstants.UNKNOWN_GROUP_VALUE = '(empty)';
TelemetryConstants.TRENDBY_INTERVAL = {
    ONE_HOUR: '1hr',
    SIX_HOUR: '6hr',
    TWELVE_HOUR: '12hr',
    TWENTY_FOUR_HOUR: '24hr',
    RAW: 'raw',
    MONTH: '1mon'
};
TelemetryConstants.MINUTELY = "minutely";
TelemetryConstants.TRENDBY_INTERVAL_MAPPING = {
    '1hr': TelemetryConstants.MINUTELY,
    '6hr': TelemetryConstants.MINUTELY,
    '12hr': TelemetryConstants.MINUTELY,
    '24hr': 'daily',
    'raw': TelemetryConstants.MINUTELY,
    '1mon': "monthly"
};
TelemetryConstants.MINUTES_SECONDS = "00:00";
TelemetryConstants.START_TIME = "StartTime";
TelemetryConstants.CHANGE_ARROW = {
    UP: 'up',
    DOWN: 'down',
    NEUTRAL: 'neutral',
    COLORS: {
        POSITIVE: "-now-datavis_color--positive",
        NEGATIVE: "--now-datavis_color--negative"
    }
};
TelemetryConstants.DATA_CONFIG_TYPE = {
    SPARKLINE: 'sparkline'
};
TelemetryConstants.OBSERVABILITY = 'OBSERVABILITY';
TelemetryConstants.TABLE = 'TABLE';
TelemetryConstants.TABLE_DA_FILTER_DSL_MAP = {
	'oauth_entity.sys_id': 'StringAttributes.integration.application.id',
	'sys_user.sys_id': 'StringAttributes.integration.user.sys_id'
};
TelemetryConstants.INBOUT_API_INTEGRATION_METRIC_NAME = 'http.inbound_api_integration';
TelemetryConstants.DATATYPE_HEADERS = {
    'aict_data': {
        'CustomerType': 'AICT'
    }
};
