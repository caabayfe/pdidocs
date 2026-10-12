var CMDBWsIREConstants = Class.create();
CMDBWsIREConstants.prototype = {
    initialize() {},

    IRE_ACTION: {
        IDENTIFY: "identify",
        INSERT: "insert",
        UPDATE: "update",
    },

    IRE_OPERATION: {
        INSERT: 'INSERT',
        UPDATE: 'UPDATE',
    },

    IRE_ERROR_CODES: {
        FAILED_IDENTIFY_CI: "FAILED_IDENTIFY_CI",
        FAILED_INSERT_CI: "FAILED_INSERT_CI",
        FAILED_UPDATE_CI: "FAILED_UPDATE_CI",
    },

    IRE_LOG_LEVEL: {
        DEBUG: 'Debug',
        INFO: 'Information',
        WARNING: 'Warning',
        ERROR: 'Error'
    },

    IRE_ERROR_CATEGORY: {
        MISSING_MATCHING_ATTRIBUTES: 'MISSING_MATCHING_ATTRIBUTES',
        MULTI_MATCH: 'MULTI_MATCH',
        LOCK_TIMEOUT: 'LOCK_TIMEOUT',
        MULTIPLE_DUPLICATE_RECORDS: 'MULTIPLE_DUPLICATE_RECORDS',
        INSERT_NOT_ALLOWED_FOR_SOURCE: 'INSERT_NOT_ALLOWED_FOR_SOURCE',
        ABANDONED: 'ABANDONED',
        NO_IDENTIFIER_KEYS_GENERATED: 'NO_IDENTIFIER_KEYS_GENERATED',
        INVALID_INPUT_DATA: 'INVALID_INPUT_DATA'
    },

    DISCOVERY_SOURCE: {
        MANUAL_VIA_IRE: 'Manual via IRE'
    },

    OPERATORS: [
        "NOT IN",
        "IN",
        "NOTON",
        "ON",
        "NOT LIKE",
        "LIKE",
        "STARTSWITH",
        "ENDSWITH",
        "<=",
        "<",
        ">=",
        ">",
        "!=",
        "=",
        "ISEMPTY",
        "ISNOTEMPTY",
        "ANYTHING",
        "EMPTYSTRING",
        "BETWEEN",
        "SAMEAS",
        "NSAMEAS",
        "DYNAMIC",
        "RELATIVEGT",
        "RELATIVELT",
        "DATEPART",
        "MORETHAN",
        "LESSTHAN",
        "GT_FIELD",
        "LT_FIELD",
        "GT_OR_EQUALS_FIELD",
        "LT_OR_EQUALS_FIELD"
    ],

    IRE_INTEGRATION_ERROR_SOURCE: 'sn_cmdb_ws_ire',

    type: 'CMDBWsIREConstants'
}
