var DataPrivacyConstants = Class.create();

DataPrivacyConstants.JOURNAL_TYPES = ['journal', 'journal_input', 'journal_list'];
DataPrivacyConstants.TABLE_SYS_AUTO_SCRIPT = 'sys_auto_script';
DataPrivacyConstants.TABLE_SYS_DICTIONARY = 'sys_dictionary';
DataPrivacyConstants.TABLE_SYS_DB_OBJECT = 'sys_db_object';
DataPrivacyConstants.TABLE_SYS_JOURNAL_FIELD = 'sys_journal_field';
DataPrivacyConstants.TABLE_SYS_PROPERTY = 'sys_properties';
DataPrivacyConstants.TABLE_SYS_HISTORY_SET = 'sys_history_set';
DataPrivacyConstants.TABLE_DP_DATA_PATTERN = 'dp_data_pattern';
DataPrivacyConstants.TABLE_M2M_CONFIG_PATTERN = 'dp_m2m_configuration_pattern';
DataPrivacyConstants.TABLE_DP_CONFIGURATION_DOMAIN_SEPARATED = 'dp_configuration_domain_separated';
DataPrivacyConstants.TABLE_DP_CHANNEL = 'dp_channel';
DataPrivacyConstants.TABLE_DP_JOB_ATTRIBUTE = 'dp_job_attribute';

DataPrivacyConstants.FIELD_NAME = 'name';
DataPrivacyConstants.FIELD_VALUE = 'value';
DataPrivacyConstants.FIELD_ELEMENT = 'element';
DataPrivacyConstants.FIELD_ELEMENT_ID = 'element_id';
DataPrivacyConstants.FIELD_SYS_ID = 'sys_id';
DataPrivacyConstants.FIELD_SYS_UPDATED_ON = 'sys_updated_on';
DataPrivacyConstants.FIELD_SYS_CREATED_ON = 'sys_created_on';
DataPrivacyConstants.FIELD_SYS_CREATED_BY = 'sys_created_by';
DataPrivacyConstants.FIELD_JOB = 'job';
DataPrivacyConstants.FIELD_JOB_TABLE = 'job_table';
DataPrivacyConstants.FIELD_VALUE_STRING = 'value_string';
DataPrivacyConstants.FIELD_VALUE_REFERENCE = 'value_reference';
DataPrivacyConstants.FIELD_VALUE_REFERENCE_TABLE = 'value_reference_table';
DataPrivacyConstants.FIELD_TABLE = 'table';
DataPrivacyConstants.FIELD_ID = 'id';
DataPrivacyConstants.FIELD_SYS_DOMAIN = 'sys_domain';

DataPrivacyConstants.FIELD_DATA_CHANNEL = 'channel';
DataPrivacyConstants.FIELD_PRIVACY_CONFIG_ID = 'config';
DataPrivacyConstants.FIELD_PRIVACY_CONFIG_TABLE = 'config_table';
DataPrivacyConstants.FIELD_ACTIVE = 'active';
DataPrivacyConstants.FIELD_ORDER = 'order';
DataPrivacyConstants.FIELD_DATA_PATTERN = 'data_pattern';

DataPrivacyConstants.KEY_QUERY = 'query';
DataPrivacyConstants.KEY_LIMIT = 'limit';
DataPrivacyConstants.KEY_ORDER_BY = 'orderBy';
DataPrivacyConstants.KEY_WINDOW = 'window';
DataPrivacyConstants.KEY_CATEGORY = 'category';

DataPrivacyConstants.DOMAIN_PLUGIN_ID = 'com.glide.domain';
DataPrivacyConstants.GLOBAL_DOMAIN = 'global';

DataPrivacyConstants.BATCH_SIZE = 100;

DataPrivacyConstants.SYS_PROPERTY_FORCE_PULL_JOURNAL_TABLE = 'glide.history_set.pull_journal_entries_from_journal_table';
DataPrivacyConstants.SYS_PROPERTY_REGULATED_INSTANCE = 'glide.regulated_instance';
DataPrivacyConstants.PREDICTIVE_INTELLIGENCE_PLUGIN_ID = "com.glide.platform_ml";
DataPrivacyConstants.PREDICTION_SERVICE_URL_KEY = "predictionServiceUrl";

/** Correlation id prefix for privacy and discovery features */
DataPrivacyConstants.CLASSIFICATION_TEMPLATE_FEATURE = "CLASSIFICATION_TEMPLATE";
DataPrivacyConstants.SDH_GENAI_CORRELATION_PREFIX = "SDH-GENAI";
/** Product action table details */
DataPrivacyConstants.DP_PRODUCT_ACTION_HISTORY_TABLE = "dp_product_action_history";
DataPrivacyConstants.CORRELATION_ID_COLUMN = "correlation_id";
DataPrivacyConstants.FEATURE_NAME_COLUMN = "feature";
DataPrivacyConstants.STATUS_COLUMN = "status_type";
DataPrivacyConstants.STATUS_MESSAGE_COLUMN = "status_message";

DataPrivacyConstants.MAINT = "maint";
DataPrivacyConstants.DATA_PRIVACY_ADMIN = "data_privacy_admin";
DataPrivacyConstants.DATA_PRIVACY_AUDITOR = "data_privacy_auditor";
DataPrivacyConstants.DATA_DISCOVERY_ADMIN = "data_discovery_admin";
DataPrivacyConstants.DP_CLONE_PROCESSOR = "data_privacy_clone_processor";
DataPrivacyConstants.DATA_PATTERN_FIELD_TYPE = "type";
DataPrivacyConstants.DATA_PATTERN_TYPE_MODEL = "model";
// SDH Migration constants
DataPrivacyConstants.SDH_GLOBAL_CATEGORY_ID = '8d7c5e3353703110926bddeeff7b1279';
DataPrivacyConstants.VA_SDH_MIGRATION_FEATURE_NAME = 'SDH Migration-VA';
DataPrivacyConstants.VA_SDH_ONE_EXTEND_DEFINITION_CONFIG_ID = '5736000bb73121100d74eb43ae11a9c5';
DataPrivacyConstants.MSFT_SDH_ONE_EXTEND_DEFINITION_CONFIG_ID = '69817efa530621100d74ddeeff7b1275';
// Data channels
DataPrivacyConstants.DATA_EXTRACTION_DATA_CHANNEL = "Data Extraction";
DataPrivacyConstants.GENERATIVE_AI_DATA_CHANNEL = "Generative AI";
DataPrivacyConstants.VA_DATA_CHANNEL = "Virtual Agent";
// Licensing constants
DataPrivacyConstants.DATA_PRIVACY_PLUGIN_ID = "com.glide.data_privacy";
DataPrivacyConstants.DATA_DISCOVERY_APP_ID = "com.snc.data_discovery";
DataPrivacyConstants.DATA_DISCOVERY_PLUGIN_ID = "com.glide.data_discovery";
DataPrivacyConstants.DATA_PRIVACY_SUBSCRIPTION_PLUGIN_ID = "com.glide.data_privacy.subscription";

// Privacy configuration types
DataPrivacyConstants.POLICY_TYPE_ANONYMIZATION = "anonymization",
DataPrivacyConstants.POLICY_TYPE_DISCOVERY = "discovery",

// Attachment real time scan constants
DataPrivacyConstants.TABLE_ATTACHMENT = "sys_attachment";
DataPrivacyConstants.FIELD_TABLE_NAME = "table_name";
DataPrivacyConstants.FIELD_TABLE_RECORD_ID = "table_sys_id";
DataPrivacyConstants.TABLE_ATTACHMENT_ATTRIBUTE = "sys_attachment_attribute";
DataPrivacyConstants.FIELD_KEY = "key";
DataPrivacyConstants.FIELD_VALUE = "value";
DataPrivacyConstants.SCAN_STATUS_ATTRIBUTE_ID = "sn_sensitive_data_scan_status";
DataPrivacyConstants.SCAN_STATUS_AVAILABLE = "available";
DataPrivacyConstants.SCAN_STATUS_PENDING = "pending";
DataPrivacyConstants.SCAN_STATUS_QUARANTINED = "quarantined";
DataPrivacyConstants.HISTORY_STATUS_RETRY_FAILED = "retry_failed";
DataPrivacyConstants.HISTORY_STATUS_IN_PROGRESS = "in_progress";
DataPrivacyConstants.SCAN_STATUS_AVAILABLE_CONDITIONALLY = "available_conditionally";
DataPrivacyConstants.IS_ATTACHMENT_SIZE_SUPPORTED = "is_attachment_size_supported";
DataPrivacyConstants.IS_ATTACHMENT_TYPE_SUPPORTED = "is_attachment_type_supported";
DataPrivacyConstants.IS_ATTACHMENT_ENCRYPTED = "is_attachment_encrypted";
DataPrivacyConstants.PROPERTY_ALLOW_DOWNLOAD_ON_ERROR = "dp.pii.document.download.allowed";
DataPrivacyConstants.ATTACHMENT_PROCESSING_CHUNK_SIZE = 4000;
DataPrivacyConstants.TABLE_ATTACHMENT_PROTECTION_HISTORY = "dp_attachment_protection_history";
DataPrivacyConstants.FIELD_ATTACHMENT_ID = "attachment";
DataPrivacyConstants.FIELD_DATA_PATTERNS = "data_pattern";
DataPrivacyConstants.FIELD_POLICY = "policy";
DataPrivacyConstants.FIELD_POLICY_TYPE = "policy_type";
DataPrivacyConstants.FIELD_PROTECTION_SOURCE = "protection_source";
DataPrivacyConstants.FIELD_SOURCE_RECORD = "source_record";
DataPrivacyConstants.FIELD_SOURCE_TABLE = "source_table";
DataPrivacyConstants.FIELD_STATUS = "status";
DataPrivacyConstants.SCAN_STATUS_FAILED = "failed";
DataPrivacyConstants.TABLE_REAL_TIME_POLICY = "dp_real_time_protection_policy";
DataPrivacyConstants.TABLE_PRIVACY_CONFIG = "dp_configuration";
DataPrivacyConstants.PROTECTION_SOURCE_REAL_TIME = "real_time";


// discovery scan api response keys
DataPrivacyConstants.SCAN_RESPONSE_KEY_ERROR = 'error';
DataPrivacyConstants.SCAN_RESPONSE_KEY_DATA_PATTERN = 'pattern';
DataPrivacyConstants.SCAN_RESPONSE_KEY_DATA_PATTERN_NAME = 'patternName';
DataPrivacyConstants.SCAN_RESPONSE_KEY_HAS_MATCHES = 'hasMatches';
DataPrivacyConstants.SCAN_RESPONSE_KEY_FINDING = 'finding';
// protection policy cache response keys
DataPrivacyConstants.POLICY_CACHE_RESPONSE_KEY_TABLE = 'tableName';
DataPrivacyConstants.POLICY_CACHE_RESPONSE_KEY_CHOSEN_FIELD = 'chosenField';
DataPrivacyConstants.POLICY_CACHE_RESPONSE_KEY_DATA_PATTERN = 'dataPatterns';
DataPrivacyConstants.POLICY_CACHE_RESPONSE_KEY_ACTIVE = 'active';
DataPrivacyConstants.POLICY_CACHE_RESPONSE_KEY_PRIVACY_CONFIG = 'privacyConfig';
DataPrivacyConstants.REAL_TIME_SCAN_EXECUTION_TYPE = {
    ON_UPLOAD: "on_upload",
    ON_DOWNLOAD: "on_download",
    ON_RETRY: "on_retry"
};
DataPrivacyConstants.RETRY_MAX_ATTACHMENTS = 5;
DataPrivacyConstants.PROPERTY_CLEANUP_FOR_AVAILABLE_DAYS = "dp.real_time.attachment_protection_history.available_status_cleanup_period_days";
DataPrivacyConstants.PROPERTY_CLEANUP_FOR_NON_AVAILABLE_MONTHS = "dp.real_time.attachment_protection_history.non_available_status_cleanup_period_months";

// catalog variable job constants
DataPrivacyConstants.SERVICE_CATALOG_REQUEST_SCOPE = "Service catalog request";
DataPrivacyConstants.RECORD_PRODUCER_SCOPE = "Record producer";
DataPrivacyConstants.CATALOG_VARIABLE_POLICY_SCOPES = [
    DataPrivacyConstants.SERVICE_CATALOG_REQUEST_SCOPE,
    DataPrivacyConstants.RECORD_PRODUCER_SCOPE
];

DataPrivacyConstants.prototype = {
    initialize: function() {},

    type: 'DataPrivacyConstants'
};
