var DMRuleConstants = Class.create();
DMRuleConstants.prototype = {
    initialize: function() {},
    type: 'DMRuleConstants',

    DATA_MANAGEMENT_CONSOLE: "Data Management Console",

    RULE_TYPES: {
        TABLE_CLEANER: "table_cleaner",
        ARCHIVE: "archive",
        ONETIME_DELETE: "onetime_delete"
    },

    TABLES: {
        SYS_AUTO_FLUSH: "sys_auto_flush",
        SYS_DM_DELETE: "sys_dm_delete",
        SYS_ARCHIVE: "sys_archive",
        SYS_ARCHIVE_DESTROY: "sys_archive_destroy",
        SYS_ARCHIVE_RELATED: "sys_archive_related",
        SYS_SCOPE: "sys_scope",
        SYS_DB_OBJECT: "sys_db_object",
        SYS_DICTIONARY: "sys_dictionary",
        SYS_DM_POLICY: "sys_dm_policy",
        SYS_DM_DELETE_COUNT: "sys_dm_delete_count"
    },

    STATUS: {
        SUCCESS: "success",
        ERROR: "error"
    },

    ERROR_CODES: {
        INVALID_TABLE: "InvalidTable",
        REARCHIVE_DURATION_ERROR: "rearchiveDurationError",
        EMPTY_SCHEDULE_TIME: "EmptyScheduleTime",
        PAST_SCHEDULE_TIME: "PastScheduleTime",
        INVALID_REFERENCE_TABLE_RULE: "InvalidReferenceTableRule",
        INVALID_REFERENCE_TABLE: "InvalidReferenceTable",
        ARCHIVE_RELATED_NOT_FOUND: "ArchiveRelatedNotFound"
    },

    ACTION: {
        ADD: "ADD",
        DELETE: "DELETE"
    },

    FIELDS: {
        NAME: "name",
        SYS_SCOPE: "sys_scope",
        INTERNAL_TYPE: "internal_type",
        SYS_ID: "sys_id",
        TABLE_NAME: "tablename",
        ACTUAL_RECORD_COUNT: "actual_record_count",
        PREVIEW_RECORD_COUNT: "preview_record_count",
        DM_DELETE: "dm_delete",
        TABLE: "table",
        SYS_CREATED_ON: "sys_created_on",
        SYS_CREATED_BY: "sys_created_by",
        ACTIVE: "active"
    },

    VALUES: {
        REFERENCE: "reference"
    },

    PREFIX: {
        ARCHIVE: "ar_"
    },

    GLOBAL: {
        SCOPE_ID: "global",
        SCOPE_NAME: "Global"
    },

    SCHEDULE_TYPE: {
        SCHEDULE_LATER: "schedule_later",
        EXECUTE_UPON_CREATION: "execute_upon_creation",
        EXECUTE_LATER: "execute_later",
    },

    ARCHIVE_COLUMNS: {
        CONDITION: "condition",
        RECORD_ESTIMATE: "record_estimate",
        ESTIMATE_DATE: "estimate_date"
    },

    ARCHIVE_DESTROY_COLUMNS: {
        RECORD_ESTIMATE: "record_estimate",
        ESTIMATE_DATE: "estimate_date"
    },

    ARCHIVE_ESTIMATE_TYPES: {
        ARCHIVE_ESTIMATE: "archiveEstimate",
        ARCHIVE_DESTROY_ESTIMATE: "archiveDestroyEstimate"
    }

};
