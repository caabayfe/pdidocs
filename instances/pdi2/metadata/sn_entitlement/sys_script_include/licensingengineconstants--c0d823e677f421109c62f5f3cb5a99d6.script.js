var LicensingEngineConstants = Class.create();
// artifact types
LicensingEngineConstants.APP_ID = 'app_id';
LicensingEngineConstants.CUSTOM_TABLE = 'custom_table';
LicensingEngineConstants.FAMILY_ID = 'family_id';
LicensingEngineConstants.FGE_ID = 'fge_id';
// messages
LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS = 'active associated subscriptions';
LicensingEngineConstants.ERROR_IN_DETERMINING = 'Error in determining ';
LicensingEngineConstants.COULD_NOT_DETERMINE = 'Could not determine ';
LicensingEngineConstants.INSTANCE_HAS_LICENSE_FOR_ARTIFACT = 'instance has license for artifact';
LicensingEngineConstants.INVALID_ARTIFACT_SPECIFIED = 'Invalid artifact specified: ';
LicensingEngineConstants.LICENSE_CHECK_REQUIRED = 'license check required';
LicensingEngineConstants.LICENSE_CHECK_REQUIRED_ATTRIBUTE = 'license check required attribute';
LicensingEngineConstants.RECORD_DOES_NOT_EXISTS_IN_TABLE = 'Record does not exists in the table ';
LicensingEngineConstants.PACKAGE_ASSOCIATED_WITH_TABLE = 'package associated with the table';
LicensingEngineConstants.APP_ASSOCIATED_WITH_PACKAGE = 'app associated with the package';
LicensingEngineConstants.USER_ACCESS_CHECK_TYPE = 'user access check type';
LicensingEngineConstants.ASSOCIATED_PACKAGE_FOR_TABLE = 'associated package for table';
LicensingEngineConstants.ASSOCIATED_APP_FOR_PACKAGE = 'associated app for package';
LicensingEngineConstants.COULD_NOT_FIND_ = 'Could not find ';
LicensingEngineConstants.ASSOCIATED_SUBSCRIPTION_TYPE = 'associated subscription type';
LicensingEngineConstants.USER_ENTITLEMENT_IS_NOT_NEEDED = 'user entitlement is not needed';
LicensingEngineConstants.LICENSE_CHECK_IS_NOT_REQUIRED = 'license check is not required';
LicensingEngineConstants.APP_DOES_NOT_EXIST = 'app does not exist';
LicensingEngineConstants.USER_ACCESS_CHECK_TYPE_FOR_THE_TABLE_ = 'User access check type for the table ';
LicensingEngineConstants.INVALID_USER_SPECIFIED = 'invalid user specified';
LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT = 'unable to determine entitlement';
LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_ARTIFACT = 'get license details for artifact';
LicensingEngineConstants.GET_SYS_ID_OF_FAMILY = 'get sys_id of family';
LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_APP = 'get license details for app';
LicensingEngineConstants.GET_LICENSE_DETAILS_FOR_APP_LIST = 'get license details for one of the app in ';
LicensingEngineConstants.FGE_NOT_FOUND_IN_CACHE = 'Given fge is not found in cache. Checking in DB.. ';
LicensingEngineConstants.OOB_TABLES_FOUND_IN_CTI = 'OOB tables found in CTI to cleanup : ';
LicensingEngineConstants.CUSTOM_TABLES_FOUND_IN_ETI = 'Custom tables found in ETI to cleanup : ';
LicensingEngineConstants.TABLE_RECORD_NOT_FOUND_IN_SYS_DB_OBJECT = 'Could not find reference in sys_db_object for table : ';
LicensingEngineConstants.MANUAL_EXEMPTION_ADDITIONAL_DETAILS = "Custom Table Inventory Cleanup Job : OOB table marked manually exempted";

// system properties
LicensingEngineConstants.GLIDE_DEV_INST_CLOSED = 'glide.installation.developer.closed_instance';
LicensingEngineConstants.GLIDE_INSTALLATION_DEVELOPER = 'glide.installation.developer';
LicensingEngineConstants.GLIDE_INSTALLATION_SELFHOSTED = 'glide.installation.self_hosted';
LicensingEngineConstants.INSTANCE_NAME = 'instance_name';
LicensingEngineConstants.PROP_GLIDE_USAGEANALYTICS_CENTRAL_INSTANCE = 'glide.usageanalytics.central_instance';
LicensingEngineConstants.PROPERTY_PREFIX_OFF_MODE = 'com.glide.entitlement.off';
LicensingEngineConstants.PROPERTY_PREFIX = 'com.glide.entitlement';
LicensingEngineConstants.PROP_ENTITLEMENT_ENFORCE_MODE = 'com.glide.entitlement.enforce_mode';
LicensingEngineConstants.OVERRIDE_PROP_ENTITLEMENT_ENFORCE_MODE = 'com.glide.entitlement.enforce_mode.override';
LicensingEngineConstants.ENTITLEMENT_ENFORCEMENT_OVERRIDABLE = 'is_entitlement_enforcement_overridable';
LicensingEngineConstants.USER_IS_NOT_ENTITLED_FOR_THE_ROLE = 'user is not entitled for the role';
LicensingEngineConstants.USER_ACCESS_CHECK_TYPE = 'user access check type';
LicensingEngineConstants.PROP_GLIDE_UA_DOWNLOADER_CENTRAL_INSTANCE = "glide.ua.downloader.central_instance";
LicensingEngineConstants.PROP_LICENSING_DOWNLOADER_PASSWORD = "glide.ua.downloader.password";
LicensingEngineConstants.PROP_GLIDE_BUILDNAME = "glide.buildname";
LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_EMS_DATA_AVAILABLE = "glide.entitlement.ems.data.available";
LicensingEngineConstants.PROP_SM_CUSTOMER_INSTANCE_MIGRATED = "glide.entitlement.customer_instance.migrated";
LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_SURF_ROUTING = "glide.entitlement.surf.routing";
LicensingEngineConstants.PROP_COM_GLIDE_LICENSING_DEBUG = "com.glide.licensing.debug";
LicensingEngineConstants.PROP_PRODUCT_METADATA_SUPPORTED_TYPES = "sn_entitlement.product_metadata_supported_types";
LicensingEngineConstants.PROP_UNCONFIRMEDCALCULATION_DISABLED = "sn_entitlement.unconfirmedcalculation.disabled";
LicensingEngineConstants.PROP_GLIDE_EXPIRED_ENTITLEMENT_MAPPING_ENABLED = "glide.entitlement.expired_entitlement_mapping_enabled";
LicensingEngineConstants.PROP_UNCONFIRMEDCALCULATION_USER_BATCH_SIZE = "glide.entitlement.unconfirmedcalculation.user_batch_size";
LicensingEngineConstants.PROP_ASSIST_USAGE_RESET_DATE = "sn_entitlement.assist_usage_reset_date";

// miscellaneous constants
LicensingEngineConstants.ACTIVE_STATUS = '0';
LicensingEngineConstants.COLON = ': ';
LicensingEngineConstants.COMMA = ',';
LicensingEngineConstants.DISABLED_SERVICENOW_COM = 'disabled.service-now.com';
LicensingEngineConstants.DOT = '.';
LicensingEngineConstants.EMPTY_STRING = '';
LicensingEngineConstants.EQUALS = '=';
LicensingEngineConstants.FALSE_ZERO = '0';
LicensingEngineConstants.FALSE = 'false';
LicensingEngineConstants.TRUE_ONE = '1';
LicensingEngineConstants.TRUE = 'true';
LicensingEngineConstants.WHERE = ' where ';
LicensingEngineConstants.USAGEANALYTICS = 'usageanalytics';
LicensingEngineConstants.USER_TYPE_ = 'user_type_'
LicensingEngineConstants.SUFFIX_ED = 'ed';
LicensingEngineConstants.TABLE = 'table';
LicensingEngineConstants.CUSTOM_TABLES = 'Custom Tables';
LicensingEngineConstants.CUSTOMTABLE_ALLOTMENT = 'CUSTOMTABLE_ALLOTMENT';
LicensingEngineConstants.ALLOTMENT_TYPE = 'ALLOTMENT_TYPE';
LicensingEngineConstants.PRODUCTION = 'Production';
LicensingEngineConstants.TRANSACTIONS = 'Transactions';
LicensingEngineConstants.METHOD_NAME = 'method_name';
LicensingEngineConstants.CLASS_NAME = 'method_name';
LicensingEngineConstants.ENTITLEMENT_APP_SCOPE = "sn_entitlement";
LicensingEngineConstants.INTEGRATIONHUBPOOL = "IntegrationHubPool";
LicensingEngineConstants.TOTAL_ASSIST_PURCHASED_COUNT = "total_assist_purchased_count";
LicensingEngineConstants.TOTAL_ASSIST_USED_COUNT = "total_assist_used_count";
LicensingEngineConstants.TOTAL_CREATOR_PURCHASED_COUNT = "total_creator_purchased_count";
LicensingEngineConstants.TOTAL_CREATOR_USER_COUNT = "total_creator_user_count";
LicensingEngineConstants.TOTAL_UNCONFIRMED_CREATOR_USER_COUNT = "total_unconfirmed_creator_user_count";
LicensingEngineConstants.ACCOUNT = "account";
LicensingEngineConstants.ACCOUNT_ID = "account_id";
LicensingEngineConstants.ACCRUAL_TIME = "accrual_time";
LicensingEngineConstants.SN_MIF_INSTANCE = 'sn_mif_instance';
LicensingEngineConstants.CREATOR = 'creator';
LicensingEngineConstants.GEN_AI = 'Gen AI';
LicensingEngineConstants.SUBSCRIPTION_ADD_ONS = 'Subscription Add-ons';
LicensingEngineConstants.HYBRID = 'Hybrid';
LicensingEngineConstants.EXCLUSION_TYPE = "exclusion_type";
LicensingEngineConstants.PLUGIN_ID = "plugin_id";
LicensingEngineConstants.PLUGIN_NAME = "plugin_name";
LicensingEngineConstants.SYS_GEN_AI_FEATURE_MAPPING = "sys_gen_ai_feature_mapping";
LicensingEngineConstants.FEATURE_NAME = "feature_name";
LicensingEngineConstants.DISTINCT_COUNT = 'COUNT(DISTINCT';
LicensingEngineConstants.USER_HAS_SUBSCRIPTION = 'user_has_subscription';
LicensingEngineConstants.SYS_GROUP_HAS_ROLE = 'sys_group_has_role';
LicensingEngineConstants.SYS_USER_HAS_LICENSE = 'sys_user_has_license';
LicensingEngineConstants.SYS_USER_HAS_ROLE = 'sys_user_has_role';

// script names
LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_DAO = 'SubscriptionEntitlementDAO';
LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO = 'SubscriptionHasAppDAO';
LicensingEngineConstants.SUBSCRIPTION_HAS_FAMILY_DAO = 'SubscriptionHasFamilyDAO';
LicensingEngineConstants.LICENSE_FAMILY_DAO = 'LicenseFamilyDao';
LicensingEngineConstants.UA_APP_FAMILY_DAO = 'UAAppFamilyDAO';
LicensingEngineConstants.UA_APP_INFO_DAO = 'UAAppInfoDAO';
LicensingEngineConstants.APP_ENTITLEMENT_PROCESSOR = 'AppEntitlementProcessor';
LicensingEngineConstants.FAMILY_ENTITLEMENT_PROCESSOR = 'FamilyEntitlementProcessor';
LicensingEngineConstants.FGE_ENTITLEMENT_PROCESSOR = 'FGEEntitlementProcessor';
LicensingEngineConstants.GLIDE_ENTITLEMENT_API = 'GlideEntitlementAPI';
LicensingEngineConstants.FAMILY_INFO_API = 'FamilyInfoAPI';
LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_DAO = 'CustomTableInventoryDAO';
LicensingEngineConstants.SYS_DB_OBJECT_DAO = 'SysDBObjectDAO';
LicensingEngineConstants.SYS_PACKAGE_DAO = 'SysPackageDAO';
LicensingEngineConstants.ENTITLEMENT_SERVICE = 'EntitlementService';
LicensingEngineConstants.CUSTOM_TABLE_ENTITLEMENT_PROCESSOR = 'CustomTableEntitlementProcessor';
LicensingEngineConstants.SKU_METADATA_ENTITLEMENT_PROCESSOR = 'SKUMetadataEntitlementProcessor';
LicensingEngineConstants.ENTITLEMENT_SERVICE = 'EntitlementService';
LicensingEngineConstants.LICENSING_ENGINE_DAO = 'LicensingEngineDAO';
LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_CLEANUP_PROCESSOR = 'CustomTableInventoryCleanupProcessor';
LicensingEngineConstants.EXEMPTED_TABLE_INVENTORY_DAO = 'ExemptedTableInventoryDAO';
LicensingEngineConstants.UNCONFIRMEDCALCULATION_DEFAULT_USER_BATCH_SIZE = "1000";

// method names
LicensingEngineConstants.GET_TABLE_ENTITLEMENT_INFO = 'getTableEntitlementInfo';
LicensingEngineConstants.GET_USER_ACCESS_CHECK_TYPE = 'getUserAccessCheckType';
LicensingEngineConstants.CAN_USER_APPROVE_ON_TABLE = 'canUserApproveOnTable';
LicensingEngineConstants.IS_USER_ENTITLED_FOR_ROLE = 'isUserEntitledForRole';
LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED = 'isLicenseCheckRequired';
LicensingEngineConstants.IS_ENTITLED = 'isEntitled';
LicensingEngineConstants.GET_ACTIVE_SUBSCRIPTIONS_FOR_APP = 'getActiveSubscriptionsForApp';
LicensingEngineConstants.GET_APP_ID_BY_PACKAGE = 'getAppIdByPackage';
LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED_FOR_APP = 'isLicenseCheckRequiredForApp';
LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED_FOR_FAMILY = 'isLicenseCheckRequiredForFamily';
LicensingEngineConstants.GET_PACKAGE_BY_TABLE = 'getPackageByTable';
LicensingEngineConstants.HAS_LICENSE_FOR_ARTIFACT = 'hasLicenseForArtifact';
LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT = 'getLicenseDetailsForArtifact';
LicensingEngineConstants.GET_PROD_INSTANCE_NAMES = 'getProdInstNamesByEntitlementIds';
LicensingEngineConstants.LICENSE_DETAILS_FOR_ARTIFACT_LIST = 'getLicenseDetailsForArtifactIdList';
LicensingEngineConstants.GET_FAMILY_SYS_ID = 'getFamilySysId';
LicensingEngineConstants.GET_ACTIVE_SUBSCRIPTION_MAP = 'getActiveSubscriptionMapForApps';
LicensingEngineConstants.GET_APP_ENTITLEMENT_MAP = 'getAppToEntitlmentMap';
LicensingEngineConstants.GET_ACTIVE_SUBSCRIPTIONS_SYS_ID_FOR_APP = 'getActiveSubscriptionSysIdsForApp';
LicensingEngineConstants.TABLE_LICENSED_FOR_ARTIFACT = 'isTableLicensedForArtifact';
LicensingEngineConstants.TABLE_ENTITLEMENT_FOR_ARTIFACT = 'isTableEntitledForArtifact';
LicensingEngineConstants.MANUALLY_EXEMPT_CUSTOM_TABLE = 'manuallyExemptCustomTable';
LicensingEngineConstants.REMOVE_MANUALLY_EXEMPT_CUSTOM_TABLE = 'removeManuallyExemptedCustomTable';
LicensingEngineConstants.EXEMPT_TABLE_TRANSACTION = 'exemptTableTransaction';
LicensingEngineConstants.UN_EXEMPT_TABLE_TRANSACTION = 'unExemptTableTransaction';
LicensingEngineConstants.INSERT_EXEMPTED_TABLE_INVENTORY_RECORD = 'insertExemptedTableInventoryRecord';

// subscription types
LicensingEngineConstants.PER_USER_LICENSE = '0';
LicensingEngineConstants.CAPACITY_LICENSE = '1';
LicensingEngineConstants.MAX_USER_LICENSE = '2';
LicensingEngineConstants.UNLIMITED_USER_LICENSE = '3';
LicensingEngineConstants.PA_INDICATOR_LICENSE = '4';
LicensingEngineConstants.DISPLAY_LICENSE = '5';
//display types
LicensingEngineConstants.DISPLAY_TYPE_DISPLAY_ONLY = '1';
// user access check types
LicensingEngineConstants.ALLOW = 'ALLOW';
LicensingEngineConstants.CHECK = 'CHECK';
LicensingEngineConstants.DISMISS = 'DISMISS';
// measured role types
LicensingEngineConstants.APPROVER = 'approver';
// enforce modes
LicensingEngineConstants.ENFORCE_MODE_OFF = 'OFF';
LicensingEngineConstants.ENFORCE_MODE_WARN = 'WARN';
LicensingEngineConstants.ENFORCE_MODE_ENFORCE = 'ENFORCE';
LicensingEngineConstants.ENFORCE_MODE_DEFAULT = 'DEFAULT';
LicensingEngineConstants.ENFORCE_MODE_UNDEFINED = 'UNDEFINED';
// users
LicensingEngineConstants.DEFAULT_USER = 'guest';
LicensingEngineConstants.SYSTEM = 'system';

// API call related
LicensingEngineConstants.ENTITLEMENT_DOWNLOAD_SERVICE_URL = "/api/now/v2/entitlementservice/getEntitlementDetails/";
LicensingEngineConstants.V3_EXEMPTED_TABLES_AND_SCOPES_SERVICE_URL = "/api/now/v3/customtableinventoryservice/getExemptedTablesAndScopes";
LicensingEngineConstants.LICENSING_ERRORS_UPLOAD_SERVICE_URL = "/api/now/licensingerroruploadservice/uploadLicesingErrors";
LicensingEngineConstants.ENTITLEMENTS_DISPLAY_DETAILS_DOWNLOAD_SERVICE_URL = "/api/now/v4/accountentitlementservice/getEntitlementsForAccount/";
LicensingEngineConstants.DEFAULT_INSTANCE_ID = "unregistered";
LicensingEngineConstants.DEFAULT_INSTANCE_NAME = "unregistered";
LicensingEngineConstants.INSTANCE_NAME = "instance_name";
LicensingEngineConstants.INSTANCE_ID = "instance_id";

//HTTP status code
LicensingEngineConstants.STATUS_OK = 200;

// HTTP status codes to licensing error codes
LicensingEngineConstants.HTTP_STATUS_CODES = {
    204: "LIC2001",
    400: "LIC2002",
    401: "LIC2003",
    404: "LIC2005",
    403: "LIC2004",
    501: "LIC2006",
    429: "LIC2007"
};

LicensingEngineConstants.ENTITLEMENT_API_CODE = {
    NO_FGE_ENTITLEMENT: "LIC7001",
    FGE_ERROR: "LIC7002",
    LICENSE_CHECK_REQUIRED_FAILED: "LIC7003",
    NO_APP_ENTITLEMENT: "LIC7004",
    NO_USER_ROLE_ENTITLEMENT: "LIC7005",
    NO_FAMILY_ENTITLEMENT: "LIC7006",
    INVALID_ARTIFACT: "LIC7007",
    NO_RECORD_EXIST: "LIC7008",
    NO_SKU_ENTITLEMENT_SUBSCRIPTION: "LIC7009"
};

LicensingEngineConstants.FAILED_DELETE_ATTEMPT_CUSTOM_TABLE_INVENTORY = 'Failed to delete record from ua_custom_table_inventory for table: ';
LicensingEngineConstants.FAILED_INSERT_ATTEMPT_EXEMPTED_TABLE_INVENTORY = 'Failed to insert record into ua_exempted_table_inventory for table: ';
LicensingEngineConstants.FAILED_DELETE_ATTEMPT_EXEMPTED_TABLE_INVENTORY = 'Failed to delete record from ua_exempted_table_inventory for table: ';
LicensingEngineConstants.FAILED_INSERT_ATTEMPT_CUSTOM_TABLE_INVENTORY = 'Failed to insert record into ua_custom_table_inventory for table: ';


LicensingEngineConstants.ENTITLEMENT_COMMON_ERROR_CODES = {
    PRODUCT_CODE_NOT_FOUND: "LIC1008"
};

//Licensing error codes
LicensingEngineConstants.LICENSING_ERROR_CODES = {
    LIC1001: 'Entitlement payload attachment is not present',
    LIC1002: 'Error while transforming payload. Error: ',
    LIC1003: 'There are no entitlements in the payload to process. ',
    LIC1004: 'Entitlement payload has null or empty value for a mandatory field. ',
    LIC1005: 'There are no subscription entitlements in the payload to further process. ',
    LIC1006: 'Error while processing payload. Error: ',
    LIC1007: 'Missing addon parent attribute value for a GenAI addon entitlement: ',
    LIC1008: 'Unable to find base entitlement with product code ',
    LIC2001: 'Subscription download request succeeded, but there is no content to send for this request. HTTP Status Code: 204 - No Content. ',
    LIC2002: 'Subscription download request failed, due to an error caused by an invalid request. HTTP Status Code: 400 - Bad Request. ',
    LIC2003: 'Subscription download request failed, due to possible credential error. HTTP Status Code: 401 - Unauthorized. ',
    LIC2004: 'Subscription download request failed, as access to the requested resource is forbidden. HTTP Status Code: 403 - Forbidden. ',
    LIC2005: 'Subscription download request failed, as the server cannot find the requested resource. HTTP Status Code: 404 - Not Found. ',
    LIC2006: 'Subscription download request failed, as the server does not support the functionality required to fulfill the request. HTTP Status Code: 501 - Not Implemented. ',
    LIC2007: 'Subscription download request failed, due to too many requests. HTTP Status Code: 429 - Too Many Requests. ',
    LIC2008: 'Subscription download request failed. HTTP Status Code: ',
    LIC2009: 'Subscription download request failed as response object is null for request. ',
    LIC3001: 'Exception in REST call. Exception: ',
    LIC7001: 'Entitlement is not present for the given fGE : ',
    LIC7002: 'Error in reading the FGE entitlement information. Error: ',
    LIC7003: 'Error while performing if license check is required for :  ',
    LIC7004: 'No active entitlement present for the app : ',
    LIC7005: 'Unable to determine if user has entitlement for role',
    LIC7006: 'Unable to determine if instance has entitlement for family',
    LIC7007: 'Invalid artifact specified',
    LIC7008: 'Record does not exist ',
    LIC7009: 'Entitlement is not present for the given SKU metadata : ',
    LIC8000: 'Migration from V1 to V2 failed'
};

// Licensing error types
LicensingEngineConstants.LICENSING_ERROR_TYPES = {
    SUBSCRIPTION_DOWNLOAD_JOB: "Subscription Download Job",
    ENTITLEMENT_PROCESSING: "Entitlement Processing",
    LICENSING_DOWNLOADER: "Licensing Downloader",
    ENTITLEMENT_API: "Entitlement API",
    MIGRATION: "Migration Job",
    ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD: "Entitlement Display Details Download"
};

//EMS Attributes
LicensingEngineConstants.MANDATORY_ATTRIBUTES = {
    SUBSCRIPTION: ['entitlement_id', 'start_date', 'end_date', 'entitlement_model', 'status', 'product_code', 'name', 'purchased_count', 'unit_of_meter'],
    APPLICATION: ['entitlement_id', 'entitlement_model', 'parent_entitlement_id', 'family_id', 'offering_name'],
    CLOUD: ['storage_capacity', 'purchased_count']
};
LicensingEngineConstants.IMPACT_L1_PACKAGE_ENTITLEMENT_MODEL_NAMES = ['Package', 'Add On Package'];
LicensingEngineConstants.IMPACT_L1_ENTITLEMENT_MODEL_NAMES = ['Preventive Care'].concat(LicensingEngineConstants.IMPACT_L1_PACKAGE_ENTITLEMENT_MODEL_NAMES);
LicensingEngineConstants.EMS_ENTITLEMENT_MODELS = {
    SUBSCRIPTION: ['Subscription', 'Dynamic Package', 'Application Store', 'Application Store TPP', 'Encryption'].concat(LicensingEngineConstants.IMPACT_L1_ENTITLEMENT_MODEL_NAMES),
    TRANSACTION: ['Transactions']
};
LicensingEngineConstants.IMPACT_L2_ENTITLEMENT_MODEL_NAMES = ['Training Discount', 'Expert Support Services Discount', 'Support Account Manager', 'Support SLA', 'Impact Hub', 'Web Based Technical Support', 'Learning Credits', 'Platform Architect', 'Developer Support', 'Customer Success Manager', 'Phone Support', 'Technical Certification Voucher', 'Success Value Accelerator', 'Success Architect', 'Adoption Toolkit', 'Instance Observer', 'Advisory Sessions', 'Outcome Driven Success Deliverable', 'On Demand Catalog', 'Product Strategy Sessions', 'Instance Observer Feature Access', 'Platform Health'];
LicensingEngineConstants.IMPACT_ENTITLEMENT_MODEL_NAMES = LicensingEngineConstants.IMPACT_L1_ENTITLEMENT_MODEL_NAMES.concat(LicensingEngineConstants.IMPACT_L2_ENTITLEMENT_MODEL_NAMES);
LicensingEngineConstants.SUBSCRIPTION_TYPE_MODEL_NAMES = ['Subscription', 'Transactions', 'Dynamic Package', 'Application Store', 'Application Store TPP', 'Encryption', 'Custom Package'].concat(LicensingEngineConstants.IMPACT_ENTITLEMENT_MODEL_NAMES);
LicensingEngineConstants.APPLICATION_TYPE_MODEL_NAMES = ['Application'];
LicensingEngineConstants.ACCOUNT_LEVEL_CLOUD_ENTITLEMENT_MODEL_NAMES = ['Environment', 'Instance Options'];
LicensingEngineConstants.EMS_DISPLAY_TYPES = {
    UE: "UE",
    CE: "CE",
    IE: "IE",
};
LicensingEngineConstants.EMS_EXCLUSION_TYPE = {
    "0": "none",
    "1": "UE",
    "2": "CE"
};
LicensingEngineConstants.EMS_STATUS_CODES = {
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    IN_ACTIVE: "IN_ACTIVE",
    CANCELLED: "CANCELLED",
    CLOSED: "ZEMS_Closed",
};
LicensingEngineConstants.EMS_STATUS_NUMBERS = {
    ACTIVE: "0",
    INACTIVE: "1",
    EXPIRED: "2",
};
LicensingEngineConstants.EMS_METER_TYPES = {
    UNRESTRICTED_USER: "Unrestricted_User",
    FULFILLER_USER: "Fulfiller_User",
};

// SubProd Entitlement data for artifact
LicensingEngineConstants.entitlementBO = {
    'isEntitled': false,
    'isPermitted': false,
    'productionInstanceNames': null,
};
LicensingEngineConstants.LICENSED = "LICENSED";
LicensingEngineConstants.UNRESTRICTED = "UNRESTRICTED";
LicensingEngineConstants.OFFERING_NAME = 'offering_name';
LicensingEngineConstants.DYNAMIC_PACKAGE = 'Dynamic Package';
LicensingEngineConstants.UNRESTRICTED_USER_DEFINITION_ID = 'DEF1000204';
LicensingEngineConstants.INTEGRATION_HUB_POOL_DEFN_ID = 'LICMCUIntegrationHubPool';
LicensingEngineConstants.ADD_ON_PARENT = 'add_on_parent';

//MDM Attributes
LicensingEngineConstants.ATTRIBUTE_1 = "ATTRIBUTE_1";
LicensingEngineConstants.ATTRIBUTE_2 = "ATTRIBUTE_2";
LicensingEngineConstants.PRODUCT_FAMILY = "PRODUCT_FAMILY";
LicensingEngineConstants.LICENSE_PRODUCT_TYPE = "LICENSE_PRODUCT_TYPE";
LicensingEngineConstants.PROGRAM_TYPE = 'PROGRAM_TYPE';
LicensingEngineConstants.CONFIG_GROUP = 'CONFIG_GROUP';
LicensingEngineConstants.PACKAGE_TYPE = 'PACKAGE_TYPE';
LicensingEngineConstants.PRODUCT_FAMILY_3 = 'PRODUCT_FAMILY_3';

//REST API retry
LicensingEngineConstants.MAX_RETRY_DEFAULT_COUNT = 1;
LicensingEngineConstants.RETRY_REQD_DEFAULT_HTTP_STATUS_CODE = "429";
LicensingEngineConstants.MAX_RETRY_DEFAULT_COUNT_PROPERTY_KEY = "glide.ua.downloader.retry.max_count";
LicensingEngineConstants.RETRY_REQD_HTTP_STATUS_PROPERTY = "glide.ua.downloader.retryable_codes";
// Custom Tables
LicensingEngineConstants.BASE_TABLE = 'base_table';
LicensingEngineConstants.SCOPE = 'scope';

// Custom Table Allotment Types
LicensingEngineConstants.ALLOTMENT_TYPES = {
    APP_ENGINE: "AppEngine",
    GRANDFATHER: "Grandfather",
    TABLE_BUNDLE: "TableBundle"
};
LicensingEngineConstants.UNLIMITED = 999999999;
LicensingEngineConstants.SUPPORTED_SKU_METADATA_TYPE = ['ih_spoke', 'ih_spoke_caller_scope', 'ih_protocol'];

//sku metadata API related
LicensingEngineConstants.LICENSE_NAME = 'license_name';
LicensingEngineConstants.LICENSE_LINE_ITEM_NAME = 'license_line_item_name';
LicensingEngineConstants.LICENSE_SYS_ID = 'license_sys_id';
LicensingEngineConstants.ASSIST = 'assist';
LicensingEngineConstants.FEATURE_ID = 'feature_id';

//MDM API
LicensingEngineConstants.CONFIG_TYPE = 'config_type';
LicensingEngineConstants.PRODUCT_CODE = 'product_code';
LicensingEngineConstants.DATA = 'data';

//cache constants
LicensingEngineConstants.LICENSING_CACHE_CATALOG = 'licensing_cache_catalog';
LicensingEngineConstants.SKU_METADATA_CACHE = 'sku_metadata_cache';
LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_ITEM_CACHE = 'subscription_entitlement_item_cache';
LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_CACHE = 'subscription_entitlement_cache';
LicensingEngineConstants.GLOBAL_CONFIG_DATA_CACHE = 'global_config_data_cache';
LicensingEngineConstants.UA_APP_INFO_CACHE = 'ua_app_info_cache';

LicensingEngineConstants.USER_SUBSCRIPTION_TABLE_UPDATE_LIMIT = 20000;

LicensingEngineConstants.ENTITLEMENT_CACHE_CATALOG = 'entitlement_cache_catalog';
LicensingEngineConstants.FGE_CACHE = 'fine_grained_entitlement_cache';
LicensingEngineConstants.GRACE_MODE = 'GRACE';
LicensingEngineConstants.GRACE_PERIOD_DAYS = 90;
LicensingEngineConstants.STRICT_MODE = 'STRICT';

//class names for a package
LicensingEngineConstants.SYS_STORE_APP = 'sys_store_app';
LicensingEngineConstants.SYS_PLUGINS = 'sys_plugins';

//assist usage last 365 days definition
LicensingEngineConstants.ASSIST_USAGE_365_DEFN_ID = "DEFN2006407";

LicensingEngineConstants.ASSIST_USAGE_YESTERDAY_DEFN_ID = "DEFN2004047";

// entitlement type
LicensingEngineConstants.ENTITLEMENT_TYPE_ACCOUNT_LEVEL = "account level";
LicensingEngineConstants.ENTITLEMENT_TYPE_INSTANCE_LEVEL = "instance level";

LicensingEngineConstants.HOSTING_TYPE_VALUE = {
    "none": "0",
    "dedicated": "1",
    "shared": "2",
    "defaultValue": "0"
};

LicensingEngineConstants.STATUS_VALUE = {
    "active": "0",
    "inactive": "1",
    "expired": "2",
    "defaultValue": "0"
};

LicensingEngineConstants.CLOUD_SUBSCRIPTON_STATUS_CHECK = [
    LicensingEngineConstants.STATUS_VALUE.active,
    LicensingEngineConstants.STATUS_VALUE.expired
];

// Adding Instance status constants
LicensingEngineConstants.INSTANCE_STATUS = {
    NON_OPERATIONAL: "Non-Operational",
    ONLINE: "Online",
    OPERATIONAL: "Operational",
    PIPELINE: "Pipeline",
    REPAIR_IN_PROGRESS: "Repair in Progress",
    RETIRED: "Retired",
    SUSPENDED: "Suspended"
};

LicensingEngineConstants.ENTITLEMENT_MODEL_ENVIRONMENT = "Environment";
LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCES = "Instances";
LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCE_OPTIONS = "Instance Options";
LicensingEngineConstants.HOSTING_TYPE_DEDICATED = "dedicated";
LicensingEngineConstants.HOSTING_TYPE_SHARED = "shared";
LicensingEngineConstants.CLOUD_STATUS_TO_PROCESS = ["active", "inactive", "expired"];
LicensingEngineConstants.INSTANCE_INFO_CACHE = "instance_info_cache";
LicensingEngineConstants.ENTITLED_APPS_CACHE = "entitled_apps_cache";
LicensingEngineConstants.SUBSCRIPTION_FAMILY_CACHE = "subscription_family_cache";
LicensingEngineConstants.LICENSE_FAMILY_CACHE = "license_family_cache";
LicensingEngineConstants.APP_INFO_CACHE = "app_info_cache";

LicensingEngineConstants.FILE_NAMES = {
    LICENSING_ROLES: "licensing_roles.json",
    EVENT_REGISTRY: "event_registry.json",
    APP_LINEAGE: "app_lineage.json",
    INSTANCE_INFO: "instance_info.xml",
    SUBSCRIPTION_ENTITLEMENT: "subscription_entitlement.json",
    ENTITLEMENT_DISPLAY_DETAILS: "entitlement_display_details.json",
    EXEMPTION_INFO: "exemption_info.json",
    TABLE_STATS_DEFINITION: "table_stats_definition.json",
    GCF_DEFINITION: "gcf_definition.json",
    METADATA: "metadata.json"
};

LicensingEngineConstants.DONOT_IMPORT_REASONS = {
    NOT_SMV2: "Instance has not migrated to SMv2",
    NOT_MAINT: "User does not have sufficient privileges",
    NOT_SELF_HOSTED: "Instance is not a self-hosted instance."
};

LicensingEngineConstants.EXPONENTIAL_BACKOFF_BASE_KEY = "glide.ua.downloader.retry.backoff.base";
LicensingEngineConstants.EXPONENTIAL_BACKOFF_BASE_DEFAULT = 10000;

LicensingEngineConstants.PRODUCT_METADATA_SUPPORTED_TYPES_PROP_DEFAULT_VALUE = JSON.stringify({
    "product_metadata_record_path": "\"$.PRODUCT_METADATA[?(@.ATTR_KEY=='ITOM_METER_BUNDLE' || @.ATTR_KEY == 'MAPPING' || @.ATTR_KEY == 'ITOM_METER_RATIO' || @.ATTR_KEY == 'INTEGRATIONHUB' || @.ATTR_KEY == 'CUSTOMTABLE_ALLOTMENT' || @.ATTR_KEY == 'GENAI_NOW_ASSIST')]\"",
    "sku_metadata_supported_types": "MAPPING,ITOM_METER_RATIO,INTEGRATIONHUB,GENAI_NOW_ASSIST"
});
