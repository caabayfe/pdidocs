var CMDBWsDMConstants = Class.create();
CMDBWsDMConstants.prototype = {
    /**
     * This class will store all Data Manager related constants, Tables and respective columns name
     */
    initialize: function() {},
    type: 'CMDBWsDMConstants',
    SCOPE: "sn_cmdb_ws",
    SYS_ID: "sys_id",
    DOMAIN: "sys_domain",
    SYS_CLASS_NAME: "sys_class_name",
    SYS_UPDATED_ON: "sys_updated_on",
    SYS_CREATED_ON: "sys_created_on",
    DEFAULT_ENCODED_QUERY: "sys_class_nameINSTANCEOFcmdb_ci",
    DEFAULT_POLICY_TABLE: "cmdb_ci",
    DEFAULT_RELATED_ENTRY_TABLE: "cmdb_key_value",
    DEFAULT_RELATED_ENTRY_ENCODED_QUERY: "configuration_itemISNOTEMPTY",
    DEFAULT_NON_CMDB_ENCODED_QUERY: "sys_idISNOTEMPTY",
    DEFAULT_EMPTY_ENCODED_QUERY: "sys_created_onISNOTEMPTY",
    DM_ERROR_SOURCE: "sn_cmdb_ws_dm",
    DEFAULT_TASK_CI_COUNT_LIMIT: 10000,
    IN: "IN",
    NAME: "name",
    TRUE: "TRUE",
    USER: "user",
    GROUP: "group",
    ACTIVE: "active",
	SEARCH_TYPES: {
		STARTSWITH: "STARTSWITH"
	},
    ROLE: {
        MAINT: "maint",
        SYSTEM: 'system',
        SCRIPT_WRITER_PERMISSION: 'snc_required_script_writer_permission',
        DATA_MANAGER_ADMIN: "data_manager_admin",
        DATA_MANAGER_USER: "data_manager_user",
		SN_CMDB_ADMIN_ROLE_ID: "1454a99d73e3a410960c6039faf6a726"
    },

    POLICY: {
        TABLE: "cmdb_data_management_policy",
        NAME: "name",
        DESCRIPTION: "description",
        TYPE: "cmdb_policy_type",
        ENCODED_QUERY: "encoded_query",
        SUBFLOW_ID: "subflow",
        ARCHIVE_FOR_DAYS: "archive_for_days",
        NEEDS_REVIEW: "needs_review",
        TASK_DUE_IN_DAYS: "task_due_in_days",
        POLICY_EXECUTION_JOB: "policy_execution_job",
        TASK_MANAGEMENT_GROUP: "task_management_group",
        TASK_MANAGEMENT_USER: "task_management_user",
        TABLE_COL: "table",
        USER_GROUP: "user_group",
        USER: "user",
        TASK_ASSIGNMENT_TYPE: "task_assignment_type",
        TASK_ASSIGNMENT_TYPE_OPTIONS: {
            SPECIFIC_USER: "specific_user",
            SPECIFIC_GROUP: "specific_user_group",
            GROUP_FIELD: "user_group_field",
            USER_FIELD: "user_field"
        },
		UNASSIGNED_TASK_ACTION: "unassigned_task_actions",
		UNASSIGNED_TASK_OPTIONS: {
			CREATE_UNASSIGNED_TASK: "create_task_unassigned",
			CREATE_ASSIGNED_TASK_TO_USER: "create_task_assigned_to_user",
			CREATE_ASSIGNED_TASK_TO_GROUP: "create_task_assigned_to_group"
		},
		UNASSIGNED_TASK_POLICY_OPTIONS: {
			CREATE_ASSIGNED_TASK: "create_assigned_task",
			CREATE_UNASSIGNED_TASK: "create_unassigned_task"
		},
		UNASSIGNED_TASK_ASSIGNEE: "unassigned_task_assignment",
		UNASSIGNED_TASK_ASSIGNMENT_TYPE: "unassigned_task_assignment_type",
		UNASSIGNED_TABLE_TYPES: {
			USER: "sys_user",
			USER_GROUP: "sys_user_group"
		},
        WORK_NOTES: "work_notes",
        ASSIGNEE: "assignee",
        TASK_MANAGEMENT_FIELD_PATH: "task_management_field_path"
    },

    CERTIFICATION_POLICY: {
        TABLE: "sn_cmdb_ws_dm_certification_policy",
        DISPLAY_FIELDS: "display_fields",
        CERTIFICATION_FIELDS: "certification_fields",
        INSTRUCTIONS: "instructions",
        TABLE_COL: "table",
        ALLOW_EMPTY_FIELDS: "allow_empty_fields",
        ALLOW_FIELD_UPDATES: "allow_field_updates"
    },
    CERT_SCHEDULE: {
        TABLE: "cert_schedule",
        ACTIVE: "active",
        ASSIGNMENT_TYPE: "assignment_type",
        ASSIGNMENT_TYPE_OPTIONS: {
            SPECIFIC_USER: "Specific User",
            SPECIFIC_GROUP: "Specific Group",
            GROUP_FIELD: "User Group Field",
            USER_FIELD: "User Field"
        },
        ASSIGN_TO: "assign_to",
        ASSIGN_TO_GROUP: "assign_to_group",
        DAYS_TO_COMPLETE: "days_to_complete",
        DISPLAY_FIELDS: "display_fields",
        FIELDS: "fields",
        FILTER: "filter",
        GROUP: "group",
        INSTRUCTIONS: "instructions",
        MIGRATION_STATUS: "migration_status",
        MIGRATION_EXCEPTION: "migration_exception",
        NAME: "name",
        TABLE_COL: "table",
        TASK_DESCRIPTION: "task_description",
        USER: "user",
        MIGRATION_STATUS_OPTIONS: {
            CANCELLED: "cancelled",
            COMPLETED: "completed",
            FAILED: "failed",
            IN_PROGRESS: "in_progress",
            IMPORTED: "imported",
            READY: "ready",
            SKIPPED_SECUIRTY_CONSTRAINTS: "skipped_security_constraints",
        },
    },
    CERT_FILTER: {
        TABLE: "cert_filter",
        FILTER_CONDITION: "filter_condition"
    },
    POLICY_CI_EXCLUSION_LIST: {
        TABLE: "cmdb_policy_ci_exclusion_list",
        POLICY_TYPE: "policy_type",
        CI: "ci"
    },
    POLICY_SCHEDULED_JOB: {
        TABLE: "cmdb_policy_scheduled_job",
        ACTIVE: 'active',
        RUN_TYPE: "run_type", //Enum: Daily/ Weekly/ Monthly/Periodically/Once/ On Demand
        RUN_TIME: "run_time",
        RUN_START: "run_start",
        RUN_PERIOD: "run_period",
        RUN_PERIOD_DISPLAY: "run_period_display",
        RUN_DAYOFWEEK: "run_dayofweek",
        RUN_DAYOFMONTH: "run_dayofmonth",
		RUN_USER: "run_as",
        SCRIPT: "script",
        NAME: "name",
        RUN_TYPE_VALUES: {
            DAILY: "daily",
            WEEKLY: "weekly",
            MONTHLY: "monthly",
            PERIODICALLY: "periodically",
            ONCE: "once",
            ON_DEMAND: "on_demand"
        }
    },

    WEEKDAYS: {
        MONDAY: "Monday",
        TUESDAY: "Tuesday",
        WEDNESDAY: "Wednesday",
        THURSDAY: "Thursday",
        FRIDAY: "Friday",
        SATURDAY: "Saturday",
        SUNDAY: "Sunday"
    },

    ROLES: {
        DATA_MANAGER_ADMIN: 'data_manager_admin',
        SN_CMDB_ADMIN: "sn_cmdb_admin",
		DATA_MANAGER_ADMIN_ROLE_SYS_ID: 'b156309e53722010af64ddeeff7b1227'
    },

    POLICY_TYPE: {
        TABLE: "cmdb_policy_type",
        NAME: "name",
        CONFIGURE_TASK_DUE_DATE: "configure_task_due_date",
        DISABLE_REVIEW: "disable_review",
        HAS_MANUAL_PROCESS: "has_manual_process",
        IS_SUBFLOW_OPTIONAL: "is_subflow_optional",
        ON_DEMAND: "on_demand",
        PER_POLICY_SCHEDULE: "per_policy_schedule",
        REQUIRES_CSDM_COMPLIANCE: "requires_csdm_compliance",
        TASK_CI_COUNT_LIMIT: "task_ci_count_limit",
        TASK_TO_CI_TABLE: "task_to_ci_table",
    },

    RUNTIME_ATTRIBUTE: {
        TABLE: "cmdb_data_management_policy_runtime_attributes",
        POLICY: "policy",
        STATUS: "status",
        STATUS_OPTIONS: {
            DRAFT: "Draft",
            PUBLISHED: "Published",
            INACTIVE: "Inactive",
            EVALUATION_FAILED: "Evaluation Failed",
            MARKED_FOR_DELETION: "Marked for Deletion"
        },
        RUN_AS: "run_as",
        OPEN_TASK_COUNT: "open_task_count",
    },

    POLICY_EXECUTION: {
        TABLE: "cmdb_data_management_policy_execution",
        NUMBER: "number",
        EXECUTION_STATE: "execution_state",
        EXECUTION_STATE_OPTIONS: {
            "COMPLETED": "Completed",
            "EXECUTING": "Executing",
            "FAILED": "Failed",
            "READY": "Ready"
        },
        POLICY: "cmdb_policy",
        EXECUTION_SUMMARY: "execution_summary",
        RECORD_COUNT: "record_count",
        OPEN_TASK_COUNT: "open_task_count",
        PERCENT_COMPLETE: "percent_complete",
        START_TIME: 'start_time',
        TOTAL_TASK_COUNT: 'total_task_count',
        COMPLETED_TASK_COUNT: 'completed_task_count',
        UNASSIGNED_TASK_COUNT: 'unassigned_task_count',
        DUE_DATE: 'due_date',
        INSTANCE_STATE: 'instance_state',
        INSTANCE_STATE_OPTIONS: {
            NOT_STARTED: 1,
            IN_PROGRESS: 2,
            COMPLETED: 3,
            PAST_DUE: 4
        }
    },

    POLICY_FAILING_EVALUATION: {
        //db view joined between RUNTIME_ATTRIBUTE and POLICY_EXECUTION on Status = Evaluation Failed and policy = cmdb_policy
        TABLE: "sn_cmdb_ws_policies_failing_evaluation"
    },

    CMDB_POLICY_TYPE_CATEGORIES: {
        TABLE: "cmdb_policy_type_categories",
        CMDB_POLICY_TYPE: "cmdb_policy_type",
        SUBFLOW_CATEGORY: "sys_hub_category"
    },

    SUBFLOW: {
        TABLE: "sys_hub_flow",
        NAME: "name",
        CATEGORY: "category",
        TYPE: "type",
        SUBFLOW: "subflow"
    },

    TASK: {
        TABLE: "cmdb_data_management_task",
        NUMBER: "number",
        POLICY: "policy_id",
        SUCCESS_PERCENT: 'success_percent',
        STATE: "state",
        STATE_OPTIONS: {
            PENDING: -5,
            OPEN: 1,
            WORK_IN_PROGRESS: 2,
            CLOSED_COMPLETE: 3,
            CLOSED_INCOMPLETE: 4,
            CLOSED_SKIPPED: 7,
            CLOSED_CANCELLED: 8
        },
        ASSIGNED_TO: "assigned_to",
        ASSIGNMENT_GROUP: "assignment_group",
        DUE_DATE: "due_date",
        POLICY_EXECUTION_ID: "execution_id",
        APPROVAL: "approval",
        APPROVAL_OPTIONS: {
            APPROVED: 'approved'
        }
    },

    TASK_TO_CI: {
        TABLE: 'cmdb_data_management_task_to_ci',
        TASK: 'cmdb_data_management_task',
        CI: 'ci',
        SYS_ID: 'sys_id',
    },

    CERTIFICATION_TASK_TO_DOCUMENT: {
        TABLE: "sn_cmdb_ws_dm_certification_task_to_document",
        TASK: "cmdb_data_management_task",
        TABLE_COL: "table",
        CI: "ci",
        STATUS: "status",
        STATUS_OPTIONS: {
            PENDING: "pending",
            CERTIFIED: "certified",
            FAILED: "failed",
            CANCELLED: 'cancelled'
        },
        ATTRIBUTE_STATUS: "attribute_status",
        CERTIFIED_VAL: "certifiedVal",
        ORIGINAL_VAL: "originalVal",
        COMMENT: "comment",
	CONTAINS_CERTIFIED_ATTRIBUTES: "contains_certified_attributes",
        CONTAINS_FAILED_ATTRIBUTES: "contains_failed_attributes"
    },

    CERTIFICATION_ATTRIBUTE_STATUS: {
        TABLE: "sn_cmdb_ws_dm_certification_attribute_status",
        TASK: "cmdb_data_management_task",
        TABLE_COL: "table",
        CERTIFICATION_RECORD: "certification_record",
        ELEMENT: "element",
        CERTIFICATION_TASK_TO_DOCUMENT: "certification_task_to_document",
        STATUS: "status",
        STATUS_OPTIONS: {
            PENDING: "pending",
            CERTIFIED: "certified",
            FAILED: "failed",
            CANCELLED: 'cancelled'
        },
        ORIGINAL_VALUE: "original_value",
        CERTIFIED_VALUE: "certified_value",
        COMMENT: "comment",
    },

    TASK_EXECUTION_CONTEXT: {
        TABLE: "sn_cmdb_ws_dm_task_execution_context",
        TASK: "cmdb_data_management_task",
        CONTEXT: "context"
    },

    RETIREMENT_CUSTOM_DEFINITIONS: {
        TABLE: "cmdb_retirement_custom_definitions",
        TABLE_COL: "table",
        RETIREMENT_DEFINITION: "retirement_definition",
        ACTIVE: "active"
    },

    CMDB_RELATED_ENTRY: {
        TABLE: 'cmdb_related_entry',
        TABLE_COL: 'table',
        ACTIVE: 'active'
    },

    SYS_USER_GROUP_MEMBER: {
        TABLE: 'sys_user_grmember',
        GROUP: 'group',
        USER: 'user'
    },

    SYS_USER_HAS_ROLE: {
        TABLE: "sys_user_has_role"
    },

	SYS_USER_HAS_ROLE_FIELDS: {
        ROLE: 'role',
        USER: 'user',
    },

    SYS_USER: {
        TABLE: "sys_user",
		SYS_ID: "sys_id"
    },
	
    SYS_DICTIONARY: {
        TABLE: "sys_dictionary",
        REFERENCE: "reference",
        SYS_USER_GROUP: "sys_user_group",
        INTERNAL_TYPE: "internal_type",
        COLUMN_LABEL: "column_label",
        ELEMENT: "element",
        NAME: "name",
		MANAGER: "manager",
		SYS_ID: "sys_id"
    },
    SYS_DB_OBJECT: {
        TABLE: 'sys_db_object',
        NAME: 'name',
        LABEL: 'label'
    },
    SYS_GROUP_HAS_ROLE: {
        TABLE: "sys_group_has_role",
    },
    SYS_CHOICE: {
        TABLE: "sys_choice",
        ELEMENT: "element",
        LABEL: "label",
        VALUE: "value"
    },
    SYS_UI_VIEW: {
        TABLE: "sys_ui_view",
        NAME: "name"
    },

    OOB_POLICY_TYPES: {
        ARCHIVE: {
            sys_id: "b82b20d00731201017b703767cd300e1",
            name: "Archive"
        },
        ATTESTATION: {
            sys_id: "7b80ed7753823010ee0dddeeff7b1223",
            name: "Attestation"
        },
        CERTIFICATION: {
            sys_id: "fe2a16b3436031106d8a8ef0dab8f2ff",
            name: "Certification"
        },
        DELETE: {
            sys_id: "562bec900731201017b703767cd300e7",
            name: "Delete"
        },
        DELETE_CMDB_RELATED_ENTRY: {
            sys_id: "c3059c79ff920110456d766cf43bf1c6",
            name: "Delete CMDB Related Entry"
        },
        DEPENDENT_CI_ARCHIVE: {
            sys_id: "b081fd511b727010a21d20a8ec4bcba1",
            name: "Dependent CI Archive"
        },
        DEPENDENT_CI_DELETION: {
            sys_id: "95eefab2533130108cabddeeff7b1218",
            name: "Dependent CI Deletion"
        },
        DEPENDENT_CI_RETIRE: {
            sys_id: "fb68f7d07301011026f6aa114df6a7e4",
            name: "Dependent CI Retire"
        },
        RETIRE: {
            sys_id: "66306fcb7352201026f6aa114df6a77c",
            name: "Retire"
        }
    },

	OOB_POLICY_TYPE_TO_CHOICE: {
		"b82b20d00731201017b703767cd300e1": "policy_type_archive",
		"7b80ed7753823010ee0dddeeff7b1223": "policy_type_attestation",
		"fe2a16b3436031106d8a8ef0dab8f2ff": "policy_type_certification",
		"562bec900731201017b703767cd300e7": "policy_type_delete",
		"b081fd511b727010a21d20a8ec4bcba1": "policy_type_dependent_ci_archive",
		"95eefab2533130108cabddeeff7b1218": "policy_type_dependent_ci_deletion",
		"fb68f7d07301011026f6aa114df6a7e4": "policy_type_dependent_ci_retire",
		"66306fcb7352201026f6aa114df6a77c": "policy_type_retire"
	},

    ASSIGNMENT: {
        DM_USER_ROLE_SYS_ID: "c627309e53722010af64ddeeff7b1232",
        ROLE: "role"
    },

    CMDB_CI: {
        LIFE_CYCLE_STAGE: 'life_cycle_stage',
        LIFE_CYCLE_STAGE_STATUS: 'life_cycle_stage_status'
    },

    ACTIONS: {
        // Policies
        DM_GET_POLICY: 'DM_GET_POLICY',
        DM_CREATE_POLICY: 'DM_CREATE_POLICY',
        DM_CREATE_RUNTIME_ATTRIBUTE: 'DM_CREATE_RUNTIME_ATTRIBUTE',
        DM_UPDATE_POLICY: 'DM_UPDATE_POLICY',
        DM_UPDATE_POLICY_GENERAL_INFO: 'DM_UPDATE_POLICY_GENERAL_INFO',
        DM_UPDATE_POLICY_DATA_FILTER: 'DM_UPDATE_POLICY_DATA_FILTER',
        DM_UPDATE_POLICY_OPTIONS: 'DM_UPDATE_POLICY_OPTIONS',
        DM_UPDATE_POLICY_ASSIGNMENT: 'DM_UPDATE_POLICY_ASSIGNMENT',
        DM_UPDATE_POLICY_SCHEDULE: 'DM_UPDATE_POLICY_SCHEDULE',
        DM_CREATE_POLICY_SCHEDULE: 'DM_CREATE_POLICY_SCHEDULE',
        DM_ACTIVATE_POLICY: 'DM_ACTIVATE_POLICY',
        DM_PUBLISH_POLICY: 'DM_PUBLISH_POLICY',
        DM_DELETE_POLICY: 'DM_DELETE_POLICY',
        DM_DELETE_POLICIES: 'DM_DELETE_POLICIES',
        DM_GET_DATA_FILTER: 'DM_GET_DATA_FILTER',
        DM_GET_POLICY_TYPE: 'DM_GET_POLICY_TYPE',
        DM_GET_POLICY_REVIEW: 'DM_GET_POLICY_REVIEW',
        DM_GET_POLICY_SCHEDULED_JOB: 'DM_GET_POLICY_SCHEDULED_JOB',
        DM_GET_POLICY_RUNTIME_ATTRIBUTE: 'DM_GET_POLICY_RUNTIME_ATTRIBUTE',
        DM_UPDATE_POLICY_RUNTIME_ATTRIBUTE: 'DM_UPDATE_POLICY_RUNTIME_ATTRIBUTE',
        DM_VALIDATE_POLICY: 'DM_VALIDATE_POLICY',
        DM_GET_SUB_FLOWS: 'DM_GET_SUB_FLOWS',
        DM_GET_ELIGIBLE_TABLES: 'DM_GET_ELIGIBLE_TABLES',
        DM_GET_ASSIGNMENT_OPTIONS: 'DM_GET_ASSIGNMENT_OPTIONS',
        DM_GET_UPCOMING_SCHEDULES: 'DM_GET_UPCOMING_SCHEDULES',
        DM_GET_POLICY_EXECUTION: 'DM_GET_POLICY_EXECUTION',
        DM_CALCULATE_POLICY_EXECUTION_PERCENTAGE: 'DM_CALCULATE_POLICY_EXECUTION_PERCENTAGE',
        // Tasks
        DM_APPROVE_TASK: 'DM_APPROVE_TASK',
        DM_CANCEL_TASK: 'DM_CANCEL_TASK',
	DM_REJECT_TASK: 'DM_REJECT_TASK',
        DM_REASSIGN_TASK: 'DM_REASSIGN_TASK',
        DM_ASSIGN_TASK_TO_CURRENT_USER: 'DM_ASSIGN_TASK_TO_CURRENT_USER',
        DM_GET_TASK_RECORD_SUMMARY: 'DM_GET_TASK_RECORD_SUMMARY',
        DM_GET_TASK_TO_CI_TABLE: 'DM_GET_TASK_TO_CI_TABLE',
        DM_VALIDATE_TASK_ASSIGNMENT: 'DM_VALIDATE_TASK_ASSIGNMENT',
        DM_EXCLUDE_RECORDS: 'DM_EXCLUDE_RECORDS',
        // Certifications
	DM_GET_CERT_TASK: 'DM_GET_CERT_TASK',
        DM_CERT_CERTIFY_RECORDS: 'DM_CERTIFY_RECORDS',
        DM_CERT_FAIL_RECORDS: 'DM_FAIL_RECORDS',
	DM_CERT_SAVE_RECORDS_COMMENT: 'DM_SAVE_RECORDS_COMMENT',
        DM_CERT_GET_ATTRIBUTE_STATUS: 'DM_GET_ATTRIBUTE_STATUS',
        DM_CERT_CERTIFY_ATTRIBUTES: 'DM_CERTIFY_ATTRIBUTES',
        DM_CERT_FAIL_ATTRIBUTES: 'DM_FAIL_ATTRIBUTES',
        DM_CERT_SAVE_ATTRIBUTES: 'DM_SAVE_ATTRIBUTES',
        DM_CERT_SAVE_ATTRIBUTES_COMMENT: 'DM_SAVE_ATTRIBUTES_COMMENT',
        DM_CERT_GET_CURRENT_ATTRIBUTE_VALUE: 'DM_GET_CURRENT_ATTRIBUTE_VALUE',
        DM_CERT_UPDATE_ATTRIBUTE_VALUE: 'DM_UPDATE_ATTRIBUTE_VALUE',
        DM_CERT_SUBMIT_TASK: 'DM_CERT_SUBMIT_TASK',
        DM_CERT_INSERT_EXECUTION_CONTEXT: 'DM_CERT_INSERT_EXECUTION_CONTEXT',
	DM_CERT_DASHBOARD_INSTANCE_AGGREGATE: 'DM_CERT_DASHBOARD_INSTANCE_AGGREGATE',
        DM_ADD_RECORD_TO_EXCLUSION_LIST: 'DM_ADD_RECORD_TO_EXCLUSION_LIST',
        DM_ADD_RECORD_TO_EXCLUSION_LIST_USING_QUERY_FILTER: 'DM_ADD_RECORD_TO_EXCLUSION_LIST_USING_QUERY_FILTER',
        DM_REMOVE_RECORD_FROM_EXCLUSION_LIST: 'DM_REMOVE_RECORD_FROM_EXCLUSION_LIST',
        DM_REMOVE_RECORD_FROM_ALL_EXCLUSION_LIST: 'DM_REMOVE_RECORD_FROM_ALL_EXCLUSION_LIST',
        DM_ADD_RETIREMENT_CUSTOM_DEFINITION: 'DM_ADD_RETIREMENT_CUSTOM_DEFINITION',
        DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION: 'DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION',
        DM_INSERT_WORKLOAD_AGG_TABLE: 'DM_INSERT_WORKLOAD_AGG_TABLE',
        DM_UPDATE_PROPERTIES: 'DM_UPDATE_PROPERTIES',
        DM_RESET_TO_DEFAULT_PROPERTIES: 'DM_RESET_TO_DEFAULT_PROPERTIES',
	DM_GET_TABLE_ROW_COUNT: 'DM_GET_TABLE_ROW_COUNT',
	DM_GET_RUN_AS_USERS: 'DM_GET_RUN_AS_USERS',
	DM_GET_DEFAULT_RUNNER: 'DM_GET_DEFAULT_JOB_RUNNER'
    },

    ERROR_CODES: {
        DM_UNKNOWN_ERROR: 'DM_UNKNOWN_ERROR',
        DM_MISSING_REQUIRED_PARAM: 'DM_MISSING_REQUIRED_PARAM',
        DM_INVALID_TABLE: 'DM_INVALID_TABLE',
        DM_FAILED_INSERT: 'DM_FAILED_INSERT',
        DM_FAILED_UPDATE: 'DM_FAILED_UPDATE',
        DM_FAILED_DELETE: 'DM_FAILED_DELETE',
        DM_INVALID_RECORD: 'DM_INVALID_RECORD',
        DM_MISSING_RETIREMENT_DEFINITION: 'DM_MISSING_RETIREMENT_DEFINITION',
        DM_USER_MISSING_WRITE_ACL: 'DM_USER_MISSING_WRITE_ACL',
        DM_USER_MISSING_READ_ACL: 'DM_USER_MISSING_READ_ACL',
        DM_USER_MISSING_DELETE_ACL: 'DM_USER_MISSING_DELETE_ACL',
        DM_USER_MISSING_CREATE_ACL: 'DM_USER_MISSING_CREATE_ACL',
        DM_USER_MISSING_ROLE: 'DM_USER_MISSING_ROLE',
        DM_POLICY_VALIDATION_ERR: 'DM_POLICY_VALIDATION_ERR',
        DM_EXCLUSION_NOT_SUPPORTED: 'DM_EXCLUSION_NOT_SUPPORTED',
        DM_EXCLUSION_INSERT_ERROR: 'DM_EXCLUSION_INSERT_ERROR',
        DM_RETIREMENT_CUSTOM_DEFINITION_VALIDATION_ERROR: 'DM_RETIREMENT_CUSTOM_DEFINITION_VALIDATION_ERROR',
        DM_FAILED_UPDATE_PROPERTIES: 'DM_FAILED_UPDATE_PROPERTIES',
        DM_FAILED_RESET_TO_DEFAULT_PROPERTIES: 'DM_FAILED_RESET_TO_DEFAULT_PROPERTIES',
        DM_MISSING_SCHEDULE_RECORD: 'DM_MISSING_SCHEDULE_RECORD',
        DM_DELETE_POLICY_SCHEDULE: 'DM_DELETE_POLICY_SCHEDULE',
        DM_EXCLUSION_INVALID_QUERY_FILTER: 'DM_EXCLUSION_INVALID_QUERY_FILTER',
        DM_INCOMPLETE_TASK: 'DM_INCOMPLETE_TASK',
    },

    TASK_FILTERS: {
        IS_OVERDUE: "due_date<javascript:gs.beginningOfToday()",
        IS_WORK_IN_PROGRESS: "state=2",
        IS_OPEN: "state=1",
        IS_NOT_CLOSED: "stateNOT IN3,4,7,8",
		IS_CLOSED: "stateIN3,4,7,8",
        ASSIGNED_TO_IS_EMPTY: "assigned_toISEMPTY",
        ASSIGNMENT_GROUP_IS_EMPTY: "assignment_groupISEMPTY",
        IS_ASSIGNED_TO_ME: "assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe",
        IS_ASSIGNED_TO_MY_GROUP: "assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744",
        IS_ASSIGNED_TO_USERS: "assigned_toIN",
        IS_ASSIGNED_TO_GROUPS: "assignment_groupIN",
        IS_ATTESTATION_TASK: "policy_id.cmdb_policy_type=7b80ed7753823010ee0dddeeff7b1223",
        IS_NOT_ATTESTATION_TASK: "policy_id.cmdb_policy_type!=7b80ed7753823010ee0dddeeff7b1223",
        IS_CERTIFICATION_TASK: "policy_id.cmdb_policy_type=fe2a16b3436031106d8a8ef0dab8f2ff",
        IS_NOT_CERTIFICATION_TASK: "policy_id.cmdb_policy_type!=fe2a16b3436031106d8a8ef0dab8f2ff",
        IS_LIFECYCLE_TASK: "policy_id.cmdb_policy_typeIN562bec900731201017b703767cd300e7,66306fcb7352201026f6aa114df6a77c,b82b20d00731201017b703767cd300e1",
        IS_APPROVAL_TASK: "policy_id.cmdb_policy_typeIN562bec900731201017b703767cd300e7,66306fcb7352201026f6aa114df6a77c,b82b20d00731201017b703767cd300e1,b081fd511b727010a21d20a8ec4bcba1,95eefab2533130108cabddeeff7b1218,fb68f7d07301011026f6aa114df6a7e4,c3059c79ff920110456d766cf43bf1c6"
    },

    TASK_APPROVAL: {
        TABLE: "sysapproval_approver",
        SYSAPPROVAL: "sysapproval",
        APPROVER: "approver",
        STATE: "state",
        STATE_OPTIONS: {
            APPROVED: 'approved',
			REJECTED: 'rejected'
        }
    },

    QUERY_FILTERS: {
        EQUAL: "=",
        IN: "IN",
        NOT_IN: "NOT IN",
        NOT_EQUAL: "!=",
        GREATER_THAN_OR_EQUAL: ">=",
        ISEMPTY: "ISEMPTY",
        OR: "^OR"
    },

    EVENTS: {
        ADD_EXCLUSION_LIST_RECORDS: "sn_cmdb_ws.addexclusionlistrecords",
        ADD_EXCLUSION_LIST_QUEUE: "sn_cmdb_ws_add_exclusion_list",
        CERTIFICATION_ACTION_ASYNC: 'sn_cmdb_ws.certification.action',
        CERTIFICATION_ATTRIBUTE_STATUS_UPDATED: 'sn_cmdb_ws.cert_attribute.status.updated',
        CERTIFICATION_DASHBOARD_TASK_UPDATED: 'sn_cmdb_ws.cert_dashboard.task.updated',
        CREATE_CERTIFICATION_VIEW: 'sn_cmdb_ws.certification.create.view',
        MIGRATE_CERT_SCHEDULES: "sn_cmdb_ws.migrate.certschedules",
        CERTIFICATION_DASHBOARD_CERT_TASK_TO_DOC_UPDATE: "sn_cmdb_ws.dc_dashboard.tasktodoc.update"
    },

    UI_DEFAULT_LIMIT: {
        DM_DELETE_POLICY: 10,
        DM_CERTIFY_RECORDS: 100,
        ASSIGNMENT_SEARCH_RESULTS_LIMIT: 50,
        DATA_FILTER_TABLE_SEARCH_RESULTS_LIMIT: 50,
		REJECT_TASK_NOTIFICATION_GROUP_LIMIT: 25,
    },
	
	NOTIFICATION_EVENTS: {
        TASK_REJECTED: 'sn_cmdb_ws.cmdbdatamanager.task.rejected',
	},

	SYS_PROPS: {
		DEFAULT_RUN_AS_USER: 'sn_cmdb_ws.glide.cmdb.data_manager.scheduled_job_default_user',
		RUN_AS_USER_GROUP: 'sn_cmdb_ws.glide.cmdb.data_manager.scheduled_job_user_group'
	}
};
