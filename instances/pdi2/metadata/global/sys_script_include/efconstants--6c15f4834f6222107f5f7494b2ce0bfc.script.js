/**
 * @class EFConstants
 * @classdesc Contains table and field constants for the Error Framework
 */
class EFConstants {
	constructor() {}

	// Table names
	static TABLES = {
		DOMAIN: 'domain',
		ERROR: 'sys_error',
		ERROR_CONFIG: 'sys_error_config',
		ERROR_CATEGORY: 'sys_error_cat',
		ERROR_CATEGORY_STATS: 'sys_error_cat_stats',
		ERROR_CODE_STATS: 'sys_error_code_stats',
		ERROR_SOURCE_APPLICATION: 'sys_error_appl',
		ERROR_CODE: 'sys_error_code',
		ERROR_INSTANCE: 'sys_error_inst',
		ERROR_CODE_INSTANCE_STATS: 'sys_error_code_inst_stats',
		ERROR_CATEGORY_INSTANCE_STATS: 'sys_error_cat_inst_stats',
		ERROR_CATEGORY_TIMESERIES_STATS: 'sys_error_cat_timeseries_stats',
		ERROR_CODE_TIMESERIES_STATS: 'sys_error_code_timeseries_stats',
		ERROR_CATEGORY_SOURCE_STATS: 'sys_error_cat_src_stats',
		ERROR_CODE_SOURCE_STATS: 'sys_error_code_src_stats',
		ERROR_ACTIONS_M2M: 'sys_error_code_to_action_m2m',
		ERROR_ACTION: 'sys_error_action',
		ERROR_ACTION_EXECUTION: 'sys_error_action_exec',
		ERROR_ACTION_EXECUTION_ITEM: 'sys_error_action_exec_item',
		ERROR_ACTION_EXECUTION_LOG: 'sys_error_action_exec_log',
		CLASSIFIER: 'sys_error_classifier',
		CLASSIFICATION_RULE: 'sys_error_class_rule',
		FLOW_INPUT: 'sys_hub_flow_input',
		ACTION_INPUT: 'sys_hub_action_input',
		ERROR_ENRICHER: 'sys_error_enricher',
		AGG_SCHEDULE_STATE: 'sys_error_agg_schedule_state'
	};

	// Field names for domain
	static DOMAIN_FIELDS = {
		SYS_DOMAIN: 'sys_domain',
		SYS_DOMAIN_PATH: 'sys_domain_path'
	};

	// Field names for sys_error
	static ERROR_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		CONTEXT: 'context',
		ENRICHED_CONTEXT: 'enriched_context',
		ERROR_CODE: 'error_code',
		REFINED_ERROR_CODE: 'refined_error_code',
		KEY: 'key',
		ERROR_SOURCE: 'error_source',
		ERROR_SOURCE_TABLE: 'error_source_table',
		MESSAGE: 'message',
		STATE: 'state',
		SUPPRESS: 'suppress',
		REOPENED_COUNT: 'reopened_count',
		SYS_CREATED_ON: 'sys_created_on',
		SYS_UPDATED_ON: 'sys_updated_on',
		LAST_OCCURRENCE: 'last_occurrence',
		REFINED_ON: 'refined_on',
		CALLER_SCRIPT: 'caller_script',
		CALLER_SCRIPT_TABLE: 'caller_script_table',
		CONSECUTIVE_COUNT: 'consecutive_count'
	};

	static ERROR_BUILDER_FIELDS = {
		ERROR_CODE: 'errorCode',
		SOURCE_APPLICATION: 'sourceApplication',
		ERROR_CATEGORY: 'errorCategory',
		MESSAGE: 'message',
		SEVERITY: 'severity',
		CONTEXT: 'context',
		ERROR_SOURCE_TABLE: 'errorSourceTable',
		ERROR_SOURCE: 'errorSource',
		ERROR_INSTANCE_TABLE: 'errorInstanceTable',
		ERROR_INSTANCE: 'errorInstance',
		STATE: 'state',
		KEY: 'key',
		SUPPRESS: 'suppress',
		CALLER_SCRIPT: 'callerScript',
		CALLER_SCRIPT_TABLE: 'callerScriptTable'
	};

	static ERROR_STATES = {
		OPEN: 'open',
		IN_PROGRESS: 'in_progress',
		CLOSED: 'closed',
		IGNORED: 'ignored',
		INACTIVE: 'inactive'
	};

	// Active error states list for queries
	static ACTIVE_ERROR_STATES = [
		EFConstants.ERROR_STATES.OPEN,
		EFConstants.ERROR_STATES.IN_PROGRESS
	];

	// Inactive error states list for queries
	static INACTIVE_ERROR_STATES = [
		EFConstants.ERROR_STATES.CLOSED,
		EFConstants.ERROR_STATES.INACTIVE
	];

	// State to color mapping for UI display
	static STATE_COLOR_MAP = {
		[EFConstants.ERROR_STATES.OPEN]: 'critical',
		[EFConstants.ERROR_STATES.IN_PROGRESS]: 'warning',
		[EFConstants.ERROR_STATES.CLOSED]: 'positive',
		[EFConstants.ERROR_STATES.IGNORED]: 'info',
		[EFConstants.ERROR_STATES.INACTIVE]: 'neutral'
	};

	static SEVERITY_LEVELS = {
		CRITICAL: 'critical',
		HIGH: 'high',
		MEDIUM: 'medium',
		LOW: 'low',
		INFO: 'info'
	};

	// Severity to color mapping for UI display
	static SEVERITY_COLOR_MAP = {
		[EFConstants.SEVERITY_LEVELS.CRITICAL]: 'critical',
		[EFConstants.SEVERITY_LEVELS.HIGH]: 'warning',
		[EFConstants.SEVERITY_LEVELS.MEDIUM]: 'moderate',
		[EFConstants.SEVERITY_LEVELS.LOW]: 'positive',
		[EFConstants.SEVERITY_LEVELS.INFO]: 'info'
	};

	static EXECUTION_STATES = {
		QUEUED: 'queued',
		IN_PROGRESS: 'in_progress',
		COMPLETED: 'completed',
		FAILED: 'failed',
		CANCELLED: 'cancelled',
		TIMEOUT: 'timeout'
	};

	static SEVERITY_VALUES = {
		CRITICAL: 0, // Critical range: 0-99
		HIGH: 100, // High range: 100-199
		MEDIUM: 200, // Medium range: 200-299
		LOW: 300, // Low range: 300-399
		INFO: 400 // Info range: 400-499
	};

	// Field names for sys_error_cat_stats
	static ERROR_CATEGORY_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_COUNT: 'error_count',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
	};

	// Field names for sys_error_code_stats
	static ERROR_CODE_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_CODE: 'error_code',
		ERROR_COUNT: 'error_count',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
	};

	// Field names for sys_error_appl
	static ERROR_SOURCE_APPLICATION_FIELDS = {
		SOURCE_APPLICATION: 'source_application',
		PLUGIN_ID: 'plugin_id',
		ERROR_PREFIX: 'error_prefix',
		APPLICATION_ADMIN_ROLE: 'application_admin_role',
		APPLICATION_OPERATOR_ROLE: 'application_operator_role',
		DEFAULT_SOURCE_TABLE: 'default_source_table',
		DEFAULT_INSTANCE_TABLE: 'default_instance_table'
	};

	// Field names for sys_error_cat
	static ERROR_CATEGORY_FIELDS = {
		SOURCE_APPLICATION: 'source_application',
		NAME: 'name',
		DESCRIPTION: 'description',
		ICON: 'icon',
		PARENT: 'parent'
	};

	// Field names for sys_error_code
	static ERROR_CODE_FIELDS = {
		SOURCE_APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		CODE: 'error_code',
		MESSAGE: 'root_cause',
		NAME: 'name',
		SEVERITY: 'severity',
		SEVERITY_LABEL: 'severity_label',
		REOPENED_COUNT: 'reopened_count',
		SUPPRESS: 'suppress',
		DEFAULT_SOURCE_TABLE: 'default_source_table',
		DEFAULT_INSTANCE_TABLE: 'default_instance_table'
	};

	// Field names for sys_error_inst
	static ERROR_INSTANCE_FIELDS = {
		ERROR_SOURCE: 'error_source',
		ERROR_SOURCE_TABLE: 'error_source_table',
		ERROR_SOURCE_INSTANCE: 'error_source_instance',
		ERROR_SOURCE_INSTANCE_TABLE: 'error_source_instance_table',
		ERROR: 'error',
		ERROR_INSTANCE: 'error_instance',
		ERROR_INSTANCE_TABLE: 'error_instance_table'
	};

	// Field names for sys_error_code_inst_stats
	static ERROR_CODE_INSTANCE_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_CODE: 'error_code',
		ERROR_COUNT: 'error_count',
		ERROR_SOURCE: 'error_source',
		ERROR_SOURCE_TABLE: 'error_source_table',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
		ERROR_INSTANCE: 'error_instance',
		ERROR_INSTANCE_TABLE: 'error_instance_table',
	};

	// Field names for sys_error_cat_inst_stats
	static ERROR_CATEGORY_INSTANCE_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_COUNT: 'error_count',
		ERROR_SOURCE: 'error_source',
		ERROR_SOURCE_TABLE: 'error_source_table',
		ERROR_INSTANCE: 'error_instance',
		ERROR_INSTANCE_TABLE: 'error_instance_table',
	};

	// Field names for sys_error_cat_timeseries_stats
	static ERROR_CATEGORY_TIMESERIES_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_COUNT: 'error_count',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
		OCCURRED_ON: 'occurred_on'
	}

	// Field names for sys_error_code_timeseries_stats
	static ERROR_CODE_TIMESERIES_STATS_FIELDS = {
		APPLICATION: 'source_application',
		ERROR_CODE: 'error_code',
		ERROR_COUNT: 'error_count',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
		OCCURRED_ON: 'occurred_on'
	}

	// Field names for sys_error_cat_src_stats
	static ERROR_CATEGORY_SOURCE_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_SOURCE: 'error_source',
		ERROR_SOURCE_TABLE: 'error_source_table',
		ERROR_COUNT: 'error_count',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
	};

	// Field names for sys_error_code_src_stats
	static ERROR_CODE_SOURCE_STATS_FIELDS = {
		APPLICATION: 'source_application',
		CATEGORY: 'error_category',
		ERROR_CODE: 'error_code',
		ERROR_SOURCE: 'error_source',
		ERROR_SOURCE_TABLE: 'error_source_table',
		ERROR_COUNT: 'error_count',
		ERROR_IGNORED_COUNT: 'error_ignored_count',
	};

	// Field names for sys_error_code_to_action_m2m
	static ERROR_ACTIONS_M2M_FIELDS = {
		APPLICATION: 'source_application',
		ERROR_CODE: 'error_code',
		ACTION: 'action',
	};

	// Field names for sys_error_action
	static ERROR_ACTION_FIELDS = {
		NAME: 'name',
		APPLICATION: 'source_application',
		ACTIVE: 'active',
		TYPE: 'type',
		MESSAGE: 'message',
		ICON: 'icon',
		ORDER: 'order',
		IS_BULK: 'is_bulk',
		SCRIPT: 'script',
		INPUT: 'input',
		TARGET_DOCUMENT_TABLE: 'target_document_table',
		TARGET_DOCUMENT: 'target_document',
	};

	// roles for error framework
	static ERROR_FRAMEWORK_ROLES = {
		ADMIN: 'error_framework.admin',
		OPERATOR: 'error_framework.operator'
	}

	static ERROR_ENRICHER_FIELDS = {
		NAME: 'name',
		DESCRIPTION: 'description',
		SOURCE_APPLICATION: 'source_application',
		ERROR_CODES: 'error_codes',
		ACTIVE: 'active',
		ORDER: 'order',
		SCRIPT: 'script',
		SYS_DOMAIN: 'sys_domain',
		SYS_DOMAIN_PATH: 'sys_domain_path'
	};

	// Field names for sys_error_agg_schedule_state
	static AGG_SCHEDULE_STATE_FIELDS = {
		SCHEDULE: 'schedule',
		LAST_EXECUTION: 'last_execution'
	};

	// Field names for sys_error_classifier
	static CLASSIFIER_FIELDS = {
		SOURCE_APPLICATION: 'source_application',
		NAME: 'name',
		DESCRIPTION: 'description',
		ACTIVE: 'active',
		REFINEMENT: 'refinement',
		ORDER: 'order',
		CLASSIFIER_TYPE: 'classifier_type',
		MATCH_CRITERIA: 'match_criteria',
		CLASSIFICATION_SCRIPT: 'classification_script',
		TARGET_ERROR_CODE: 'target_error_code'
	};

	// Classifier type values
	static CLASSIFIER_TYPES = {
		CRITERIA: 'criteria',
		SCRIPT: 'script'
	};

	// Match criteria values
	static MATCH_CRITERIA = {
		ALL: 'all',
		ANY: 'any'
	};

	// Field names for sys_error_class_rule
	static CLASSIFICATION_RULE_FIELDS = {
		CLASSIFIER: 'classifier',
		FIELD: 'field',
		SEARCH_TYPE: 'search_type',
		OPERATOR: 'operator',
		VALUE: 'value',
		TABLE_NAME: 'table_name',
		CONDITION: 'condition'
	};

	// Search type values for classification rules
	static SEARCH_TYPES = {
		SHALLOW: 'shallow',
		DEEP: 'deep',
		PATH: 'path'
	};

	// Operator values for classification rules
	static OPERATORS = {
		EQUALS: 'equals',
		STARTS_WITH: 'starts_with',
		ENDS_WITH: 'ends_with',
		CONTAINS: 'contains',
		DOES_NOT_CONTAIN: 'does_not_contain',
		DOES_NOT_EQUAL: 'does_not_equal',
		DOES_NOT_START_WITH: 'does_not_start_with',
		DOES_NOT_END_WITH: 'does_not_end_with',
		REGEX_MATCHES: 'regex_matches',
		REGEX_DOES_NOT_MATCH: 'regex_does_not_match',
		IS_EMPTY: 'is_empty',
		IS_NOT_EMPTY: 'is_not_empty',
		GREATER_THAN: 'greater_than',
		LESS_THAN: 'less_than',
		GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
		LESS_THAN_OR_EQUAL: 'less_than_or_equal',
		AFTER_RELATIVE_TIME: 'after_relative_time',
		BEFORE_RELATIVE_TIME: 'before_relative_time',
		RECORD: 'record'
	};

	static ERROR_CONFIG_FIELDS = {
		SOURCE_APPLICATION: 'source_application',
		VALUE: 'value'
	}

	static ERROR_CONFIG_DEFAULT_SYS_ID = '05c8dc44b1a6402fb5041fd9d5102f41';

	static ERROR_SOURCE_APP_DEFAULT_SYS_ID = '2eae2cab81336614f877085b2c4c55dd';

	static CONFIG_CACHE = 'error_framework_config_cache';

	// Action types
	static ACTION_TYPES = {
		SCRIPT: 'script',
		SUBFLOW: 'subflow',
		FLOW_ACTION: 'flow_action',
		SCRIPTED_REST_RESOURCE: 'scripted_rest_resource'
	};

	// Event names for the error framework event queues
	static EVENT_NAMES = {
		ACTION_STANDARD: 'error.framework.action.standard',
		ACTION_EXPEDITED: 'error.framework.action.expedited',
		ERROR_PROCESS: 'error.framework.error.process',
	};

	// HTTP status codes
	static HTTP_STATUS = {
		SUCCESS_MIN: 200,
		SUCCESS_MAX: 300
	};

	// System roles
	static SYSTEM_ROLES = {
		MAINT: 'maint'
	};

	// Field size limits
	static FIELD_LIMITS = {
		CONTEXT_MAX_LENGTH: 8000,
		CONTEXT_TRUNCATE_LENGTH: 7900
	};

	// Default timeout values (in milliseconds)
	static TIMEOUTS = {
		FLOW_DEFAULT: 60000
	};

	// Configuration property names (top-level keys only; callers drill into nested props)
	static CONFIG_PROPERTIES = {
		ENABLED: 'enabled',
		LOGGING: 'logging',
		CLEANUP: 'cleanup',
		REQUIRED_ORIGIN: 'requiredOrigin',
		ADDITIONAL_UNIQUE_FIELDS: 'additionalUniqueFields',
		CLASSIFICATION: 'classification',
		ASYNC: 'async',
		MAX_CALLS_PER_TRANSACTION: 'maxCallsPerTransaction'
	};

	// Default values for configuration properties
	static CONFIG_DEFAULTS = {
		MAX_CALLS_PER_TRANSACTION: 100000
	};

	// Configuration values for requiredOrigin
	static REQUIRED_ORIGIN_VALUES = {
		SOURCE: 'source',
		BOTH: 'both',
		NONE: 'none'
	};

	static SKILL_PLATFORM_PATH = gs.getProperty('glide.servlet.uri') + "now/now-assist-admin/skill-list/00202261eb383110da1861c59c5228e4";

	static EF_ERRORS = {
		// --- Core Framework Errors ---
		INTERNAL_SERVER_ERROR: {
			message: sn_i18n.Message.getMessage('error_framework', 'Internal server error occurred')
		},

		// --- General Errors ---
		UNKNOWN_ERROR: {
			message: sn_i18n.Message.getMessage('error_framework', 'Unknown error occurred')
		},
		MISSING_REQUIRED_PARAMETER: {
			message: sn_i18n.Message.getMessage('error_framework', 'Required parameter is missing')
		},
		VALIDATION_FAILED: {
			message: sn_i18n.Message.getMessage('error_framework', 'Invalid request parameters')
		},
		ONE_OF_CONDITION_FAILED: {
			message: sn_i18n.Message.getMessage('error_framework', 'Request must satisfy one of the specified conditions')
		},
		INVALID_USER_ROLE: {
			message: sn_i18n.Message.getMessage('error_framework', 'User does not have required role')
		},

		// --- Action Errors ---
		ACTION_TARGET_NOT_FOUND: {
			message: sn_i18n.Message.getMessage('error_framework', 'Action target not found')
		},
		ACTION_EXECUTION_FAILED: {
			message: sn_i18n.Message.getMessage('error_framework', 'Action execution failed')
		},
		ACTION_NOT_AVAILABLE: {
			message: sn_i18n.Message.getMessage('error_framework', 'No applicable action available for current error state')
		},

		// --- Logging & API Errors ---
		LOGGING_API_INSUFFICIENT_PERMISSION: {
			message: sn_i18n.Message.getMessage('error_framework', 'Insufficient permission to access logging API')
		},
		LOGGING_API_INVALID_PAYLOAD: {
			message: sn_i18n.Message.getMessage('error_framework', 'Logging API payload is invalid')
		},
		LOGGING_API_FAILURE: {
			message: sn_i18n.Message.getMessage('error_framework', 'Failed to log error to framework')
		},

		// --- Registration & Configuration Errors ---
		SOURCE_APP_NOT_REGISTERED: {
			message: sn_i18n.Message.getMessage('error_framework', 'Source application not registered')
		},
		ERROR_CODE_NOT_REGISTERED: {
			message: sn_i18n.Message.getMessage('error_framework', 'Error code not found in catalog')
		},

		// --- Aggregation & Scheduling Errors ---
		AGGREGATION_SCHEDULE_NOT_FOUND: {
			message: sn_i18n.Message.getMessage('error_framework', 'Aggregation schedule not found')
		},
		AGGREGATION_EXECUTION_FAILED: {
			message: sn_i18n.Message.getMessage('error_framework', 'Aggregation job execution failed')
		}
	};
}
