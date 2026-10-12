function include({ imports }) {
    const STATE = {
        ARCHIVE_METRIC_ESTIMATE_VALUES: "archiveMetricEstimateValues",
        CURRENT_SCOPE: "currentScope",
        TABLE_SCOPE: "tableScope",
        FORM_VALIDATOR_JSON: "formValidatorJson",
        SELECTED_TAB_ID: "selectedTabId",
        SELECTED_RULE_TYPE: "selectedRuleType",
        RULE_DATA: "ruleData",
        SAVED_RULE_DATA: "savedRuleData",
        MESSAGES: "messages",
        ALL_TABS: "tabsForContentTree",
        TC_MATCHFIELD_OPTIONS: "tableCleanerMatchfieldOptions",
        ROLLBACK_EXCLUDED_LIST: "rollbackExcludedList",
        AGE_FIELD_ALERT: "ageFieldAlert",
        AGE_FIELD_VALIDITY: "ageFieldValidity",
        RETAIN_REF_CHECKBOX_DISABLED: "retainReferenceCheckBoxDisabled",
        ARCHIVE_DURATION_ALERT: "archiveDurationAlert",
        RULE_UPDATE_ALERT: "ruleUpdateAlert",
        IS_EDIT_FLOW: "isEditFlow",
        DISABLE_UPDATE_ACTION: "disableUpdateAction",
        EXECUTION_TIME_ALERT: "executionTimeAlert",
        ACTION: "action",
        ARCHIVE_ACTIVATION_MESSAGE: "archiveActivationMessage",
        DESTROY_DURATION_VALIDITY: "destroyDurationValidity",
        DESTROY_DURATION_ALERT: "destroyDurationAlert",
        PREVIEW_CASCADE_DATA: "previewCascadeData",
        DM_POLICY_ALERT: "dmPolicyActiveStateAlert",
        PARTIAL_QUERY_ALERT: "partialQueryAlert"
    };

    const RULE_TYPE = {
        TABLE_CLEANER: "table_cleaner",
        ARCHIVE: "archive",
        ONETIME_DELETE: "onetime_delete"
    };

    /* Tab ids used in content tree navigation json */
    const TAB_ID = {
        ARCHIVE_BASIC_INFROMATION: "archive.basic_information",
        ARCHIVE_DEFINE_CONDITIONS: "archive.define_conditions",
        ARCHIVE_DESTROY_ARCHIVED_RECORDS: "archive.destroy_archived_records",
        ARCHIVE_MANAGE_RELATED_RECORDS: "archive.manage_related_records",
        ARCHIVE_VIEW_SUMMARY: "archive.view_summary",
        TC_BASIC_INFORMATION: "table_cleaner.basic_information",
        TC_DEFINE_CONDITIONS: "table_cleaner.define_conditions",
        TC_ADDITIONAL_ACTIONS: "table_cleaner.set_additional_actions",
        TC_SUMMARY: "table_cleaner.view_summary",
        OTD_BASIC_INFORMATION: "onetime_delete.basic_information",
        OTD_DEFINE_CONDITIONS: "onetime_delete.define_conditions",
        OTD_ADDITIONAL_ACTIONS: "onetime_delete.set_additional_actions",
        OTD_SCHEDULE: "onetime_delete.set_up_schedule",
        OTD_SUMMARY: "onetime_delete.view_summary"
    };
    // Steps in rule creation process
    const STEPS = {
        BASIC_INFROMATION: "basic_infromation",
        DEFINE_CONDITIONS: "define_conditions",
        ADDITIONAL_ACTIONS: "set_additional_actions",
        SCHEDULE: "set_up_schedule",
        DESTROY_ARCHIVED_RECORDS: "destroy_archived_records",
        MANAGE_RELATED_RECORDS: "manage_related_records",
        SUMMARY: "view_summary"
    };

    /* Alert message types */
    const MESSAGE_TYPE = {
        CRITICAL: "critical",
        WARNING: "warning",
        POSITIVE: "positive",
        INFO: "info",
        SUGGESTION: "suggestion"
    };

    // Table column name constants
    const COLUMNS = {
        NAME: "name",
        DESCRIPTION: "description",
        TABLENAME: "tablename",
        TABLE: "table",
        MATCHFIELD: "matchfield",
        AGE: "age",
        CONDITIONS: "conditions",
        CONDITION: "condition",
        CLEAN_PERIPHERAL: "clean_peripheral",
        CLEAN_AUDIT: "clean_audit",
        CASCADE_DELETE: "cascade_delete",
        SET_WORKFLOW: "set_workflow",
        RUN_AT: "run_at",
        ACTIVE: "active",
        RETAIN_REFERENCES: "retain_references",
        DESTROY_RULE: "destroy_rule",
        DESTROY_RELATED: "destroy_related",
        SYS_ID: "sys_id"
    };

    const UI_ELEMENT_ID = {
        CONDITIONS: "conditions",
        RECORD_ROLLBACK: "record_rollback",
        ENABLE_DATA_DESTROY: "enable_data_destroy",
        YEARS_DESTROY_DURATION: "years_destroy_duration",
        DAYS_DESTROY_DURATION: "days_destroy_duration",
        HOURS_DESTROY_DURATION: "hours_destroy_duration",
        ACTIVATE_DESTROY: "activate_destroy"
    };

    const OTD_SCHEDULE = {
        SCHEDULE_TYPE: "schedule_type", 
        SCHEDULE_LATER: "schedule_later",
        EXECUTE_UPON_CREATION: "execute_upon_creation",
        EXECUTE_LATER: "execute_later",
    }

    const ERROR_CODES = {
        REARCHIVE_DURATION_ERROR: "rearchiveDurationError",
        EMPTY_SCHEDULE_TIME: "EmptyScheduleTime",
        PAST_SCHEDULE_TIME: "PastScheduleTime"
    };

    const CONSTANT = {
        YEAR_IN_DAYS: 365,
        DAY_IN_HOURS: 24
    };

    const ARCHIVE_METRIC_ESTIMATE_TYPE = {
        ARCHIVE_ESTIMATE: "archiveEstimate",
        ARCHIVE_DESTORY_ESTIMATE: "archiveDestroyEstimate"
    };

    const ACTION = {
        ADD: "ADD",
        DELETE: "DELETE"
    };

    const EVENT = {
        CLOSE_POPUP: "CLOSE.POPUP",
        OPEN_RULE_SUCCESS_POPUP: "OPEN.RULE.CREATION.SUCCESS.POPUP",
        OPEN_DESTROY_ARCHIVE_POPUP: "OPEN.DESTROY.ARCHIVE.POPUP",
        OPEN_SCHEDULE_CONFIRMATION_POPUP: "ON.OTD.SCHEDULE.CONFIRMATION.POPUP"
    };

    const STATUS = {
        SUCCESS: "success",
        ERROR: "error"
    };

    return {
        STATE,
        RULE_TYPE,
        MESSAGE_TYPE,
        COLUMNS,
        STEPS,
        TAB_ID,
        UI_ELEMENT_ID,
        OTD_SCHEDULE,
        ERROR_CODES,
        MANAGE_RELATED_RECORDS,
        EVENT,
        STATUS,
        ACTION,
        CONSTANT,
        ARCHIVE_METRIC_ESTIMATE_TYPE
    }
}
