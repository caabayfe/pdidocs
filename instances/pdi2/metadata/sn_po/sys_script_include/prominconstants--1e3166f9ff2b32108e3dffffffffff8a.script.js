var ProminConstants = Class.create();

//Tables
ProminConstants.TABLE_PROJECT_ENTITY = "promin_project_entity";
ProminConstants.TABLE_LICENSE_SKU = "promin_entitlement_sku";
ProminConstants.TABLE_CASE_DATA = "promin_case_data";
ProminConstants.TABLE_USAGE_DATA = "promin_metered_usage_data";
//Columns
ProminConstants.COL_ADD_ON_PLUGIN = "add_on_plugin";
ProminConstants.COL_PRIMARY_PLUGIN = "primary_plugin";

//Licensing constants
ProminConstants.PROMIN_CORE_PLUGIN = "com.sn_process_optimization";
ProminConstants.EXT_DATA_PLUGIN = "com.sn_po_extdata";
ProminConstants.PROMIN_PLATFORM_PLUGIN = "com.sn_promin_platform_vp";
ProminConstants.EXTERNAL_DATA = "EXTERNAL_DATA";
ProminConstants.APP_ID = "app_id";
ProminConstants.AI_NATIVE_PLUGIN = "com.sn_promin_ai_native_vp";
ProminConstants.AI_NATIVE_DEFINITION_ID = "DEFN2023792";
ProminConstants.ANNIVERSARY_METER_BASED_DEFINITION_ID = "DEFN1008900";

//Properties
ProminConstants.DISABLE_METER_COUNT_PROPERTY = "promin.metered_usage.disable_counting";
ProminConstants.LICENSE_SKIP_PROPERTY = "promin.entitlement_check.override.date";
ProminConstants.FREEMIUM_FEATURE_PROPERTY = "promin.feature.enable_evaluation";
ProminConstants.METER_USAGE_WARNING_LIMIT = "promin.metered_usage.warning_limit";
ProminConstants.ALLOW_UNRESTRICTED_PROPERTY = "promin.metered_usage.allow_unrestricted";
ProminConstants.METERED_USAGE_ENTITLEMENT_PROPERTY = "promin.metered_usage.entitlement_value";
ProminConstants.METERED_USAGE_ANNIVERSARY_DATE_PROPERTY = "promin.metered_usage.anniversary_date";
ProminConstants.FORCE_CAPACITY_LICENSE_PROPERTY = "promin.metered_usage.force_capacity_license";

//Metered guardrails
ProminConstants.CROP_TRANSITION_OVERSPEND_MULTIPLIER = 5;
ProminConstants.COL_FIRST_MINED_ON = "first_mined_on";
ProminConstants.COL_CASE_ID = "case_id";

// Page size for iterating promin_case_data and flushing into _processUsageDataBatch /
// _processUsageDataBatchMetered. Each batch translates into one SELECT + N writes against
// promin_metered_usage_data, so keeping this bounded keeps the per-batch round-trip count
// predictable for large projects.
ProminConstants.USAGE_DATA_BATCH_SIZE = 200;
