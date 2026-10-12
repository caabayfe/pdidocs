var CMDBWsManualCreateCIConstants = Class.create();
CMDBWsManualCreateCIConstants.prototype = Object.extendsObject(CMDBWsIREConstants, {
	/**
	 * This class will store all Create CI related constants, Tables and respective columns name
	 */
	initialize: function() {},
	type: 'CMDBWsManualCreateCIConstants',

	MCC_ERROR_SOURCE: "sn_cmdb_ws_mcc",
	OPERATIONAL_STATUS: "operational_status",
	TO_BE_DETERMINED: "To Be Determined",
	
	SYS_PROPERTY: {
		MANUAL_CI_GLOBAL_EXCLUSION: 'sn_cmdb_ws.manual_create_ci.global_class_exclusion'
	},
	
	ERROR_CODES: {
		MCC_UNKNOWN_ERROR: 'MCC_UNKNOWN_ERROR',
		MCC_MISSING_REQUIRED_PARAM: 'MCC_MISSING_REQUIRED_PARAM',
		MCC_FAILED_IDENTIFY_CI: 'MCC_FAILED_IDENTIFY_CI',
		MCC_FAILED_CREATE_CI: 'MCC_FAILED_CREATE_CI',
		MCC_INVALID_TABLE: 'MCC_INVALID_TABLE',
		MCC_FAILED_INSERT: 'MCC_FAILED_INSERT',
		MCC_FAILED_UPDATE: 'MCC_FAILED_UPDATE',
		MCC_FAILED_DELETE: 'MCC_FAILED_DELETE',
		MCC_INVALID_RECORD: 'MCC_INVALID_RECORD',
		MCC_USER_MISSING_WRITE_ACL: 'MCC_USER_MISSING_WRITE_ACL',
		MCC_USER_MISSING_READ_ACL: 'MCC_USER_MISSING_READ_ACL',
		MCC_USER_MISSING_DELETE_ACL: 'MCC_USER_MISSING_DELETE_ACL',
		MCC_USER_MISSING_CREATE_ACL: 'MCC_USER_MISSING_CREATE_ACL',
		MCC_USER_MISSING_ROLE: 'MCC_USER_MISSING_ROLE',
		MCC_FAILED_UPDATE_PROPERTIES: 'MCC_FAILED_UPDATE_PROPERTIES',
		MCC_FAILED_RESET_TO_DEFAULT_PROPERTIES: 'MCC_FAILED_RESET_TO_DEFAULT_PROPERTIES'
	},

	TABLES: {
		CMDB_REL_CI: 'cmdb_rel_ci',
		CMDB: 'cmdb',
		CMDB_CI: 'cmdb_ci',
		CMDB_REL_PERSON: 'cmdb_rel_person',
		CMDB_REL_USER_TYPE: 'cmdb_rel_user_type',
		CMDB_REL_GROUP: 'cmdb_rel_group',
		CMDB_REL_GROUP_TYPE: 'cmdb_rel_group_type',
		SYS_CHOICE: 'sys_choice',
		SYS_DB_OBJECT: 'sys_db_object'
	},

	COLUMNS: {
		NAME: 'name',
		CI: 'ci',
		TYPE: 'type',
		USER: 'user',
		GROUP: 'group',
		LABEL: 'label',
		SYS_CLASS_NAME: 'sys_class_name',
		SYS_CREATED_ON: 'sys_created_on',
		SYS_ID: 'sys_id'
	},

	ACTIONS: {
		// IRE Error
		MCC_PRASE_IRE_ERROR_WARNING: 'MCC_PARSE_IRE_ERROR_WARNING',
		MCC_IDENTIFY_CI: 'MCC_IDENTIFY_CI',
		MCC_CREATE_CI: 'MCC_CREATE_CI',
		MCC_GET_MANDATORY_FIELD: 'MCC_GET_MANDATORY_FIELD',
		MCC_GET_IRE_RULES: 'MCC_GET_IRE_RULES',
		MCC_GET_EXCLUDED_CLASSES: 'MCC_GET_EXCLUDED_CLASSES',
		MCC_GET_ADDITIONAL_ATTRS: 'MCC_GET_ADDITIONAL_ATTRS',
		MCC_PROCESS_IDENTIFICATION_RULES: 'MCC_PROCESS_IDENTIFICATION_RULES',
		MCC_SEARCH_REF_TABLE: 'MCC_SEARCH_REF_TABLE',
		MCC_GET_LIFE_CYCLE_STAGE_OPTIONS: 'MCC_GET_LIFE_CYCLE_STAGE_OPTIONS',
		MCC_GET_LIFE_CYCLE_STATUS_OPTIONS: 'MCC_GET_LIFE_CYCLE_STATUS_OPTIONS',
		MCC_GET_CI_CLASSES: 'MCC_GET_CI_CLASSES',
		MCC_CHECK_CLASS_HAS_IDENTIFICATION_RULES: 'MCC_CHECK_CLASS_HAS_IDENTIFICATION_RULES'
	},

	SEARCH_TYPES: {
		STARTSWITH: "STARTSWITH",
		CONTAINS: "LIKE"
	},

	// Tables
	SYS_DICTIONARY: {
		TABLE: 'sys_dictionary',
		NAME: 'name',
		ELEMENT: 'element',
		TYPE: 'internal_type',
		LABEL: 'column_label',
		MANDATORY: 'mandatory',
		MAX_LENGTH: 'max_length',
		DEFAULT_VALUE: 'default_value',
		DYNAMIC_DEFAULT_VALUE: 'dynamic_default_value',
		DISPLAY: 'display',
		CHOICE: 'choice',
		REFERENCE: 'reference',
		REFERENCE_QUALIFIER: 'reference_qual',
		COLUMN_TYPE: {
			REFERENCE: 'reference'
		}
	},

	CMDB_REL_TYPE: {
		TABLE: 'cmdb_rel_type',
		NAME: 'name',
		CHILD_DESCRIPTOR: 'child_descriptor',
		PARENT_DESCRIPTOR: 'parent_descriptor',
	},
	
     CI_CLASS_CONFIG: {
		TABLE: 'sn_cmdb_ws_ci_class_config',
		FEATURE: 'feature',
		FEATURE_OPTIONS: {
			CREATE_CI: 'create_ci'
		},
		CI_CLASS: 'cmdb_ci_class',
		OPERATION: 'operation',
		OPERATION_OPTIONS: {
			INCLUDE_CLASS: 'include_class',
			EXCLUDE_CLASS: 'exclude_class',
		},
		APPLY_TO_HIERARCHY: 'apply_to_hierarchy',
		ACTIVE: 'active',
		CONFIG_ID: 'config_identifier_id'
	},

	CI_ADDITIONAL_ATTR_CONFIG: {
		TABLE: 'sn_cmdb_ws_ci_additional_attributes',
		FEATURE: 'feature',
		FEATURE_OPTIONS: {
			CREATE_CI: 'create_ci'
		},
		CI_CLASS : 'cmdb_ci_class',
		APPLY_TO_HIERARCHY: 'apply_to_hierarchy',
		ATTRIBUTES: 'attributes',
		ACTIVE: 'active',
		CONFIG_ID: 'config_identifier'
	},

	SYS_CHOICE: {
		ELEMENT: "element",
		LABEL: "label",
		VALUE: "value",
		NAME: "name"
	},
});
