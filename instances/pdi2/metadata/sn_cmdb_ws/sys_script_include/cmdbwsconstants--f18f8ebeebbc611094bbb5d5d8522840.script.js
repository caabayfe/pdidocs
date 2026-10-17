var CMDBWsConstants = Class.create();
CMDBWsConstants.prototype = {
    initialize: function() {},

    SCOPE: "sn_cmdb_ws",

    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",

    DATATYPE: {
        BOOLEAN: "boolean",
        NUMBER: "number",
        STRING: "string"
    },

    ROLES: {
        MAINT: "maint",
        SN_CMDB_ADMIN: "sn_cmdb_admin",
        SN_CMDB_EDITOR: "sn_cmdb_editor",
        SN_CMDB_USER: "sn_cmdb_user",
        ASSET: "asset",
        CMDB_INST_ADMIN: "cmdb_inst_admin",
        SN_CMDB_WS_CONFIG_EDITOR: "sn_cmdb_ws.config_editor",
        SN_CMDB_WS_CONFIG_ADMIN: "sn_cmdb_ws.config_admin"    
    },

	DYNAMIC_FILTERS: {
		ME: '90d1921e5f510100a9ad2572f2b477fe',
		ONE_OF_MY_GROUPS: 'd6435e965f510100a9ad2572f2b47744'
	},

    TABLES: {
        //cmdb_ci tables
        CMDB: 'cmdb',
        CMDB_CI: 'cmdb_ci',
        CMDB_REL_CI: 'cmdb_rel_ci',
        CMDB_GROUP: 'cmdb_group',
        CMDB_GROUP_CONTAINS_ENCODED_QUERY: "cmdb_group_contains_encoded_query",
        CMDB_CI_LOGICAL_DATACENTER: 'cmdb_ci_logical_datacenter',
        CLOUD_SERVICE_ACCOUNT: 'cmdb_ci_cloud_service_account',
        CMDB_IRE_PARTIAL_PAYLOADS: 'cmdb_ire_partial_payloads',
        CMDB_CI_ENDPOINT: 'cmdb_ci_endpoint',
        CMDB_RELATED_ENTRY: 'cmdb_related_entry',
        CMDB_CLASS_INFO: 'cmdb_class_info',
        CMDB_CI_SERVICE: 'cmdb_ci_service',

        // cmdb workspace tables
        SN_CMDB_WS_GROUP_QUERY_METADATA: 'sn_cmdb_ws_group_query_metadata',
        SN_CMDB_WS_GROUP_METADATA: "sn_cmdb_ws_group_metadata",
        SN_CMDB_WS_DATACENTER_TYPE: 'sn_cmdb_ws_datacenter_type',
        SN_CMDB_WS_QUERY_CATEGORY: 'sn_cmdb_ws_insight_query_category', //internally referred as mapping table
        SN_CMDB_WS_INSIGHT_DATA: 'sn_cmdb_ws_insight_data', // old table used to store aggregate data for insights (will be deprecated in future)
        SN_CMDB_WS_PRODUCT_INSIGHT_DATA: 'sn_cmdb_ws_product_insight_data', // new table for storing aggregate data for insights(extends from base aggregate data table)
        SN_CMDB_WS_ATTESTATION_TASK_TO_CI: "sn_cmdb_ws_attestation_task_to_ci",
        SN_CMDB_WS_DM_CERTIFICATION_TASK_TO_DOCUMENT: 'sn_cmdb_ws_dm_certification_task_to_document',
        SN_CMDB_WS_IMP_ACTION_CARD_CONFIG: "sn_cmdb_ws_imp_action_card_config",
        SN_CMDB_WS_FEATURE_CATEGORY: "sn_cmdb_ws_feature_category",
        SN_CMDB_WS_FEATURE_CATEGORY_METADATA: "sn_cmdb_ws_feature_category_metadata",
        SN_CMDB_WS_FEATURE_CATEGORY_EXECUTION_STATS: "sn_cmdb_ws_feature_category_execution_stats",
        SN_CMDB_WS_FEATURE_CATEGORY_ACTIVATION_AUDIT: "sn_cmdb_ws_feature_category_activation_audit",
        SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE: 'sn_cmdb_ws_feature_category_runtime_attribute',
        SN_CMDB_WS_RATING_CONFIG: "sn_cmdb_ws_rating_config",
        SN_CMDB_WS_SERVICENOW_DISCOVERY_SOURCE: "sn_cmdb_ws_servicenow_discovery_source",
        SN_CMDB_WS_BASE_AGGREGATE_DATA: 'sn_cmdb_ws_base_aggregate_data',
        SN_CMDB_WS_SERVICE_GRAPH_CONNECTOR: 'sn_cmdb_ws_service_graph_connector',
        SN_CMDB_WS_PARTIAL_PAYLOAD_ITEM: 'sn_cmdb_ws_partial_payload_item',
        SN_CMDB_WS_APP_SVC_INSIGHT_DATA: 'sn_cmdb_ws_app_svc_insight_data',
        SN_CMDB_WS_INTEGRATION_AGGREGATE_DATA: 'sn_cmdb_ws_integration_aggregate_data',
        SN_CMDB_WS_WORKLOAD_AGG_DATA: 'sn_cmdb_ws_workload_aggregate_data',

        //qb tables
        QB_SAVED_QUERY: 'qb_saved_query',
        QB_QUERY_STATUS: 'qb_query_status',
        SYSAUTO_QUERY_BUILDER: 'sysauto_query_builder',

        // sys tables
        SYS_CHOICE: 'sys_choice',
        SYSAUTO: 'sysauto',
        SYSAUTO_PA: 'sysauto_pa',
        SYSAUTO_SCRIPT: 'sysauto_script',
        M2M_ACTION_ASSIGNMENT_ACTION_CONFIG: "sys_ux_m2m_action_assignment_action_config",
        SYS_OBJECT_SOURCE: 'sys_object_source',
        PA_JOB_LOGS: 'pa_job_logs',
        SYS_DB_OBJECT: 'sys_db_object',
        SYS_DATA_SOURCE: 'sys_data_source',
        SCHEDULED_IMPORT_SET: 'scheduled_import_set',
        SYS_PROPERTIES: 'sys_properties',
        SYS_ARCHIVE_RUN_CHUNK: 'sys_archive_run_chunk',
        SYS_USER: 'sys_user',
		SYS_USER_GROUP: 'sys_user_group',
        SYS_DICTIONARY: 'sys_dictionary',
        SYS_TRIGGER: 'sys_trigger',

        // data manager tables
        CMDB_DATA_MANAGER_POLICY_AND_ATTRIBUTES: 'cmdb_data_manager_policy_and_attributes',
        CMDB_DATA_MANAGEMENT_POLICY_EXECUTION: 'cmdb_data_management_policy_execution',
        CMDB_DATA_MANAGEMENT_TASK: 'cmdb_data_management_task',
        CMDB_DATA_MANAGEMENT_TASK_TO_CI: 'cmdb_data_management_task_to_ci',
        CMDB_DATA_MANAGEMENT_POLICY: 'cmdb_data_management_policy',
        CMDB_CI_STATE_MANAGEMENT_TASK_TO_CI: 'cmdb_ci_state_management_task_to_ci',

        // IH-ETL tables
        CMDB_INST_APPLICATION: 'cmdb_inst_application',
        CMDB_INST_APPLICATION_FEED: 'cmdb_inst_application_feed',

        // Integration tables
        SN_CMDB_INT_UTIL_CMDB_INTEGRATION_EXECUTION: 'sn_cmdb_int_util_cmdb_integration_execution',

        // NLQ
        NLQ_QUERY_LOG: 'nlq_query_log',

        //svc_ci_assoc
        SVC_CI_ASSOC: 'svc_ci_assoc',

        // CMDB Health tables
        CMDB_HEALTH_RESULT: 'cmdb_health_result',
        CMDB_DUPLICATE_AUDIT_RESULT: 'cmdb_duplicate_audit_result',

        //PA tables
        PA_SCORES_L1: 'pa_scores_l1',
        PA_INDICATORS: 'pa_indicators',

        PROGRESS_MONITOR: 'sn_cmdb_ws_progress_monitor'
    },

    PERSONAS: {
        CMDB_ADMIN: 'cmdb_admin',
        CMDB_EDITOR: 'cmdb_editor'
    },

    COLS: {
        SYS_ID: 'sys_id',
        RULE_ID: 'rule_id',
        ID: 'id',
        TYPE: 'type',
        CI_CATEGORY: 'ci_category',
        CI_CLASS: 'ci_class',
        CI_CLASS_NAME: 'ci_class_name',
        CI_SYS_CLASS_NAME: 'ci_sys_class_name',
        CI_LOOKUP_COL: 'ci_lookup_col',
        CLASS_NAME: 'class_name',
        CLOUD_PROVIDER: 'cloud_provider',
        COUNT: 'count',
        STATE: 'state',
        LAST_REFRESHED: 'last_refreshed',
        DATACENTER_CLASS: 'datacenter_class',
        FAILURE_COUNT: 'failure_count',
        ACTIVE: 'active',
        DOT: ".",
        DISCOVERY_SOURCE: 'discovery_source',
        TARGET_SYS_ID: 'target_sys_id',
        TARGET_TABLE: 'target_table',
        SOURCE_FEED: 'source_feed',
        IN: 'IN',
        SYS_CREATED_ON: 'sys_created_on',
        SYS_UPDATED_ON: 'sys_updated_on',
        ORDER: 'order',
        USER: 'user',
        USER_GROUP: 'user_group',

        //CI table columns
        SYS_CLASS_NAME: 'sys_class_name',


        //svc_ci_assoc columns
        SERVICE_ID: 'service_id',
        CI_ID: 'ci_id',

        //cmdb_rel_ci columns
        PARENT: 'parent',
        CHILD: 'child',

        //qb table columns
        QUERY: 'query',
        RESULT_TABLE: 'result_table',
        STATUS: 'status',
        TABLE: 'table',
        TABLE_NAME: 'table_name',
        UPDATED: 'sys_updated_on',
        SOURCE: 'source',
        REPORT_SOURCE: 'report_source',

        // sys table columns
        NAME: 'name',
        ELEMENT: 'element',
        VALUE: 'value',
        LABEL: 'label',
        SYS_SCOPE: 'sys_scope',
        REFERENCE: 'reference',
        COLUMN_LABEL: 'column_label',

        GROUP_TYPE: 'group_type',
        CLASS: 'class',
        CONDITION: 'condition',
        SIMPLE_CONDITION: 'simple_condition',
        CI_COUNT: 'ci_count',
        ENCODED_QUERY: 'encoded_query',
        PERSONA: 'persona',
        GROUP: 'group',

        //product config table columns
        RATING: 'rating',
        START: 'start',
        END: 'end',

        //feature category table
        MARKETING_COPY: 'marketing_copy',
        FEATURE: 'feature',
        CATEGORY: 'category',
        SUB_CATEGORY: 'sub_category',
        TITLE: 'title',
        AGGREGATE_LIMIT: "aggregate_limit",
        AGGREGATE_LIMIT_UNIT: "aggregate_limit_unit",
        FAIL_COUNT_THRESHOLD: "fail_count_threshold",
        RUNTIME_THRESHOLD: "runtime_threshold",

        ATTESTATION_STATUS: 'attestation_status',

        // base aggregate table columns
        CHART: 'chart',
        GROUP_BY: 'group_by',
        DYNAMIC_GROUP_BY: 'dynamic_group_by',
        GROUP_BY_TABLE: 'group_by_table',

        //app svc insight table columns
        SERVICE: 'service',

        // cmdb data management policy execution
        EXECUTION_SUMMARY: 'execution_summary',
        END_TIME: 'end_time',

        // service graph connector
        APPLICATION_ID: 'app_id',
        SCOPE: 'scope',
        COMPANY: 'company',
        // Partial Payload
        PAYLOAD_ITEM: 'payload_item',
        PARTIAL_PAYLOAD: 'partial_payload',
        ERROR_TYPE: 'error_type',
        INTERNAL_ID: 'internal_id',

        // Important action config
        FILTER_CONDITIONS: 'filter_conditions',
        RUN_TYPE: 'run_type',
        LIST_COLUMNS: 'list_columns',
        LIST_GROUPBY: 'list_groupby',

        // PA job logs
        COMPLETED: 'completed',
        JOB: 'job',

        // Feature category runtime attributes
        FEATURE_CATEGORY: 'feature_category',
        QUERY_ALL_DATA: 'query_all_data',
        LAST_RUN_TIME: 'last_run_time',
        KEY: 'key',
        JSON: 'json',

        // Feature category execution stats
        RUN_TIME: 'run_time',
        EXECUTION_STATUS: 'execution_status',

        // Feature category activation audit
        ACTION_TYPE: 'action_type',
        AUDIT_INFO: 'audit_info',

        // CMDB related entry
        REFERENCED_FIELD: 'referenced_field',

        // Sys Data source
        USE_BATCH_IMPORT: 'use_batch_import',

        // Scheduled import set
        DATA_SOURCE: 'data_source',
        CONCURRENT_IMPORT: 'concurrent_import',
        PARTITION_METHOD: 'partition_method',

        // CMDB Inst App Feed
        SYS_DATA_SOURCE: 'sys_data_source',

        // CMDB Integration Executions fields
        APPLICATION: 'application',

        //PA table columns
        INDICATOR: 'indicator',
        START_AT: 'start_at',

        //Data Management Policy Fields
        CMDB_POLICY_TYPE: 'cmdb_policy_type',
        CMDB_POLICY_SUBFLOW: 'subflow',
        CMDB_TASK_MANAGEMENT_GROUP: 'task_management_group',

        //Data Management Task Fields
        SHORT_DESCRIPTION: 'short_description',
        POLICY_ID: 'policy_id',
        ASSIGNED_TO: 'assigned_to',
        ASSIGNMENT_GROUP: 'assignment_group',
        APPROVAL: 'approval',

        MANUFACTURER: 'manufacturer',
        LOCATION: 'location',
        LIFE_CYCLE_STAGE: 'life_cycle_stage',
        LIFE_CYCLE_STAGE_STATUS: 'life_cycle_stage_status',

        CERTIFICATION_FIELDS: 'certification_fields',

        // progress monitor
        PERCENT_COMPLETE: 'percent_complete',
        TOTAL_COUNT: 'total_count',
        PROCESSED_COUNT: 'processed_count',

        // sys trigger table columns
        DOCUMENT_KEY: 'document_key',
        NEXT_ACTION: 'next_action',
        TRIGGER_TYPE: 'trigger_type',
    },

    BOOLEAN: {
        TRUE: 'true',
        FALSE: 'false'
    },

    OPERATORS: {
        ISEMPTY: "ISEMPTY",
        GREATER: '>',
        OR: "^OR",
        AND: "^",
        NOTLIKE: "NOT LIKE",
        NOTIN: 'NOT IN',
        NOTEQUAL: "!=",
        EQUAL: '=',
        STARTSWITH: 'STARTSWITH',
        LESSTHAN: '<',
        LESSTHAN_OR_EQUAL: '<=',
        NEW_QUERY: '^NQ',
        END_QUERY: '^EQ',
        ISNOTEMPTY: "ISNOTEMPTY",
        IN: 'IN',
        DYNAMIC: 'DYNAMIC',
        CONTAINS: 'CONTAINS'
    },

    ARCHIVE_RULES: {
        ARCHIVE_CONFIGURATION_ITEMS: 'b6650a917353601026f6aa114df6a7d0'
    },

    SCHEDULED_JOBS: {
        CMDB_WS_AGGREGATES_MONTHLY_PA_JOB: '9a8f494c77592110ee0d0cc2fa5a99f1', //aggregates monthly PA job
        CMDB_WS_AGGREGATES_DAILY_PA_JOB: '6949143cb7312110b87e80408e11a9b0', //aggregates daily PA job
        CMDB_WS_POPULATE_AGGREGATES_DAILY: '0dcd4f777397e010960c6039faf6a799',
        CMDB_WS_POPULATE_AGGREGATES_MONTHLY: '461ca87f77d52110ee0d0cc2fa5a99bf',
        CMDB_WS_COLLECTION_ON_DEMAND_WITH_LOOKBACK: '8cc453dbeb7a611094bbb5d5d852287f'
    },

    SYS_PROPERTIES_NAME: {
        MULTISRC_ENABLED: 'glide.identification_engine.multisource_enabled',
        CIS_MANAGED_BY_ME: 'sn_cmdb_ws.ci_overview.managed_by_me.enabled',
        ENABLE_TOTAL_CIS: 'sn_cmdb_ws.total_cis.enabled',
        SHOULD_USE_SIMPLE_CONDITION: 'sn_cmdb_ws.ci_overview.enable_simple_condition',
        APPSTORE_BASE_URL: 'sn_appclient.repository_base_url',
        CIS_PROCESSED_VIA_IRE_BY_SOURCE_FULL_SCAN: 'sn_cmdb_ws.cis_processed_via_ire.by_source.full_scan',
        IMPORTANT_ACTION_IGNORE_SESSION_CACHE: 'sn_cmdb_ws.important_action.ignore_session_cache',
        FEATURE_METRICS_CALCULATION_DISABLED: 'sn_cmdb_ws.feature_metrics_calculation.disabled',
        PARTIAL_PAYLOAD_BATCH_SIZE: 'sn_cmdb_ws.partial_payload.batch_size',
		CERT_INSTANCE_CACHE_SIZE: 'sn_cmdb_ws.dc_dashboard.cert_instance.cache_size',
        LIST_RECORD_COUNT_LIMIT: {
            NAME: 'sn_cmdb_ws.list.record_count_limit',
            DEFAULT_VALUE: 100000
        },
        EXPLORE_CI_RECORD_ENABLED: 'sn_cmdb_ws.explore_ci.record.enabled',
		LIST_RECORD_COUNT_LIMIT_EXCLUDED_TABLES: {
			NAME: 'sn_cmdb_ws.list.record_count_limit_excluded_tables',
			DEFAULT_VALUE: 'cmdb_duplicate_audit_result,sn_cmdb_ws_policies_failing_evaluation'
		}
    },

    PLUGINS: {
        INTEGRATION_HUB_ETL: 'com.sn_int_studio',
        DATA_FOUNDATION_DASHBOARD: 'sn_getwell',
        CMDB_APPLICATION_FOR_API_AND_CLI: 'sn_service_graph',
        ITOM_DISCOVERY_LICENSE: 'com.snc.itom.discovery.license',
        ITOM_LICENSE: 'com.snc.itom.license'
    },

    LICENSE: {
        ITOM_DISCOVERY: 'com.snc.itom.discovery.license'
    },

    EXECUTION_STATUS: {
        STARTED: 1,
        COMPLETED: 2,
        EXCEEDED: 3,
        ERROR: 4
    },

    ACTION_TYPE: {
        MANUAL: 1,
        AUTOMATIC: 2
    },

    ATTESTATION_STATUS: {
        NOT_YET_REVIEWED: "Not Yet Reviewed",
        ATTESTED: "Attested",
        REJECTED: "Rejected"
    },

    CMDB_WORKSPACE_ACTION_CONFIG_ID: "aa116c28b7a11110b87e80408e11a928",
    WORKSPACE_PARAM: "workspace",
    COUNT_AGGREGATE: "count",
    COUNT_DISTINCT_AGGREGATE: 'COUNT(DISTINCT',
    QUERY_INSTANCEOF: 'INSTANCEOF',
    CMDB_WORKSPACE_DB_CATEGORY: 'cmdb_workspace',
    IH_ETL_DEMODATA_PREFIX: 'IH-ETL-DemoData',

    // CIs processed via IRE
    CI_DISCOVERY_SOURCE: 'ci_discovery_source',
    BATCH_DEFAULT_SIZE: 1000,
    MAX_BATCH_EXECUTION_TIME: 600, // seconds
    CIS_PROCESSED_VIA_IRE_SIMPLE_CONDITION: '',

    DISCOVERY_TYPE: {
        SGC: "sg_connector",
        SN: "discovery",
        SGC_SN: "sgc_discovery",
        OTHER: "other"
    },

    SERVICENOW_DISCOVERY_SOURCE: {
        SERVICENOW: 'ServiceNow',
        SERVICEWATCH: 'ServiceWatch',
        ACC_VISIBILITY: 'ACC-Visibility',
        AGENT_CLIENT_COLLECTOR: 'AgentClientCollector',
        CREDENTIALLESS_DISCOVERY: 'CredentiallessDiscovery'
    },

    IF_USE_IRE_GROUPBY: {
        USING_IRE_TYPE: 'using_ire',
        NOT_USING_IRE_TYPE: 'not_using_ire',
    },

    SGC_GROUP_BY_VALUE: {
        SGC_TOTAL: 'total',
        SGC_INSTALLED: 'installed'
    },

    QUALIFIER: {
        SG: 'SG-',
        SGO: 'SGO'
    },

    DATAMANAGER_POLICIES: {
        DELETE: {
            SYS_ID: "562bec900731201017b703767cd300e7",
            GROUP_BY: "policy_type_delete",
            SUBFLOW: "037c691b7362201026f6aa114df6a743" // TODO: Do we use this?? Seems like value is not correct
        },
        ARCHIVE: {
            SYS_ID: "b82b20d00731201017b703767cd300e1",
            GROUP_BY: "policy_type_archive",
            SUBFLOW: "5bf1cedd7313601026f6aa114df6a762" // TODO: Do we use this?? Seems like value is not correct
        },
        RETIRE: {
            SYS_ID: "66306fcb7352201026f6aa114df6a77c",
            GROUP_BY: "policy_type_retire",
            SUBFLOW: "11c9511d73fe201026f6aa114df6a751" // TODO: Do we use this?? Seems like value is not correct
        },
        ATTESTATION: {
            SYS_ID: "7b80ed7753823010ee0dddeeff7b1223",
            GROUP_BY: "policy_type_attestation",
            SUBFLOW: ""
        },
        DEPENDENT_CI_DELETION: {
            SYS_ID: "95eefab2533130108cabddeeff7b1218",
            GROUP_BY: "policy_type_dependent_ci_deletion",
            SUBFLOW: ""
        },
        DEPENDENT_CI_RETIRE: {
            SYS_ID: "fb68f7d07301011026f6aa114df6a7e4",
            GROUP_BY: "policy_type_dependent_ci_retire",
            SUBFLOW: ""
        },
        DEPENDENT_CI_ARCHIVE: {
            SYS_ID: "b081fd511b727010a21d20a8ec4bcba1",
            GROUP_BY: "policy_type_dependent_ci_archive",
            SUBFLOW: ""
        }
    },

    QUERY_BUILDER_SOURCE: 'QB',
    INTELLIGENT_SEARCH_SOURCE: 'CMDB_WS',
    SOURCE_TYPE: "source_type",
    CMDB_QB: "cmdb_qb",

    INSIGHT_PRODUCT_CATEGORIES: {
        DATA_INGESTION: "80fd4e6853012110b87eddeeff7b121b",
        DATA_GOVERNANCE: "2f3e06a853012110b87eddeeff7b122d",
        SEARCH_AND_ANALYTICS: "3e5e46a853012110b87eddeeff7b1258"
    },

    STATES: {
        DRAFT: 1,
        READY: 2,
        RETIRED: 3
    },

    RUN_TYPE: {
        ON_DEMAND: 1,
        DAILY: 2,
        MONTHLY: 3
    },

    CATEGORY: {
        CLOUD_AND_NONCLOUD_CIS: "b75a75f053812110b87eddeeff7b12bf",
        REJECTED_CIS: "fd0993f4ef1b2110785294c1ed97d7d5"
    },

    SUB_CATEGORY_NAME: {
        CIS_PROCESSED_VIA_IRE: 'cis_processed_via_ire',
        CIS_PROCESSED_VIA_IRE_BY_SOURCE: 'cis_processed_via_ire_by_source'
    },

    SUB_CATEGORY: {
        DATA_MANAGER: "864e06a853012110b87eddeeff7b1231",
        DATA_ATTESTATION: "205e06a853012110b87eddeeff7b1235",
        QUERY_BUILDER: "c0ce8aa853012110b87eddeeff7b1284",
        CIS_PROCESSED_VIA_IRE: '350ece6853012110b87eddeeff7b12e0',
        CIS_PROCESSED_VIA_IRE_BY_SOURCE: '651e82a853012110b87eddeeff7b1245',
        SERVICE_GRAPH_CONNECTOR: '58ed4e6853012110b87eddeeff7b1218',
        INTELLIGENT_SEARCH: "16cecaa853012110b87eddeeff7b1291",
        RELATED_RECORDS: "34562862b7262110b87e80408e11a984",
        RELATIONSHIP_MISSING_PARENT_OR_CHILD: '3facd5bfeb13211094bbb5d5d85228f4',
        PARTIAL_PAYLOAD_ITEM: '7daf572377622110ee0d0cc2fa5a9941',
        TOTAL_PARTIAL_PAYLOADS: '5e9cd5bfeb13211094bbb5d5d85228f1',
        CLOUD_AND_NONCLOUD_APP_SVC: "5571ce7e432221106d8a8ef0dab8f2eb",
        STALE_RECORDS: "f15410fe537e2110ba6cddeeff7b1238",
        DUPLICATE_RECORDS: "ae1f80e453836110ba6cddeeff7b12b5",
        INTEGRATION_PROCESSING_RATE_OUTLIER: "2c4e3dc7eb36611094bbb5d5d8522835",
        INTEGRATION_ROWS_OUTLIER: "415e3dc7eb36611094bbb5d5d85228f1",
        AGING_TASKS: "73a1c64ed47c7110f877425f204deda9",
        USER_WORKLOAD: "1de8dacd535d3110af64ddeeff7b12b3",
        USER_GROUP_WORKLOAD: "3af8dacd535d3110af64ddeeff7b12ca",
        IMPORTANT_ACTION: '8d7897a677c28210ee0d0cc2fa5a99f2',
        TOTAL_CI: '72e0ecebff9562109829ffffffffffbc',
        CERT_INSTANCE_AGGREGATE: '9e53a41053912610129bddeeff7b1293',
        CERT_DASHBAORD_AGING_TASK: '82f0b9c2532d2210129bddeeff7b1239',
        CERT_DASHBOARD_USER_GROUP_WORKLOAD: '15278c3653ada210129bddeeff7b1271',
        CERT_DASHBOARD_USER_WORKLOAD: '92960cf253ada210129bddeeff7b12db',
		ACTIVE_CERT_INSTANCE: 'b3554ec353b5a610129bddeeff7b12e3'
    },

    CMDB_FEATURE_ADOPTION: 'cmdb_feature_adoption',

    EXEC_SUMM_CI_COUNT_PREFIX: "CI Count:",

    QB_REPORTS_GROUPBY: {
        TOTAL_QUERIES_EXECUTED: "total_queries_executed",
        TOTAL_QUERIES_EXECUTED_REPORTS: "total_queries_executed_with_reports",
        TOTAL_CI: 'total_ci',
        TOTAL_CI_REL: 'total_ci_rel'
    },

    HREF_FOR_ROUTE_TYPE: 'javascript:void(0);',
    LIST_ROUTE: 'list',
    UNIFIED_MAP_ROUTE: 'unifiedmap',
    LINK_TYPES: {
        ROUTE: 'route',
        EXTERNAL: 'external'
    },

    SCHEDULED_JOB_RUN_TYPE: {
        AGGREGATES_DAILY_JOB: 'aggregates_daily_job',
        AGGREGATES_MONTHLY_JOB: 'aggregates_monthly_job',
    },

    PA_JOB_LOGS_STATE: {
        COLLECTED_OK: 'collected_ok'
    },

    NLQ_GROUP_BY_VALUE: {
        NLQ_NO_OF_QUERIES: 'nlq_num_of_queries'
    },

    PA_INDICATORS: {
        QB_USAGE: {
            ID: '2ac2bd18eb51211094bbb5d5d8522839',
            BREAKDOWN: {
                TOTAL_QUERY: {
                    ID: 'cdc6f11ceb51211094bbb5d5d852283e'
                }
            }
        },
        DATA_MANAGER: {
            ID: '36a86199eb55211094bbb5d5d852281a'
        },
        DATA_ATTESTATION: {
            ID: '249b6d1deb55211094bbb5d5d852287c'
        },
        INTELLIGENT_SEARCH: {
            ID: '09b0a5c4eb11211094bbb5d5d8522863'
        },
        INTEGRATION_ROWS: {
            ID: 'b43b2616ebf2211094bbb5d5d8522828',
            BREAKDOWN: {
                CMDB_INST_APPLICATION: {
                    ID: '482ac39eeb36211094bbb5d5d852285e'
                }
            }
        },
        INTEGRATION_PROCESSING_RATE: {
            ID: '408aaad2ebf2211094bbb5d5d85228bd',
            BREAKDOWN: {
                CMDB_INST_APPLICATION: {
                    ID: '482ac39eeb36211094bbb5d5d852285e'
                }
            }
        }
    },

    PA_SCORES_LOOKBACK_LIMIT: 90,

    SCH_IMP_PARTITON_METHOD: {
        CUSTOM_SIZE: 'customSize'
    },
    STALENESS_METRIC_QUERY: 'metric=d4772b5137130200f212cc028e41f16c^active=true',
    ACTION_CONFIG_DAILY_TYPE_IDS: ['e619b235b7211110b87e80408e11a9b9', '1a0c05b6b7611110b87e80408e11a9f1', '47384e3e53211110b87eddeeff7b12a7', 'e4498e7e53211110b87eddeeff7b124d', '480a82be53211110b87eddeeff7b1219', 'c4eab8ddb7311110b87e80408e11a9df'],

    ACTION_CONFIG_CATEGORY: {
        IMPORTANT_ACTION: 'important_action',
        RECOMMENDATION: 'recommendation'
    },

    IRE_DEBUG_LOG_LEVEL: {
        INFO: 'info',
        DEBUG: 'debug'
    },

    TRIGGER_TYPE: {
        DEMAND: "2"
    },

	CLASS_ICONS: {
		MAPPING_TABLE: "sn_cmdb_ws_class_icon_mapping",
		ICON_NAME_COLUMN: "icon_name"
	},

    type: 'CMDBWsConstants'
};
