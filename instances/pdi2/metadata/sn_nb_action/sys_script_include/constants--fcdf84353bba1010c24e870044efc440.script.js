var Constants = Class.create();
            Constants.prototype = {
                initialize: function() {},
                type: 'Constants'
            };
            // Table Names
            Constants.TBL_ACTION_DETAIL = "sn_nb_action_detail";
            Constants.TBL_ACTION_ORDER_DETAIL = "sn_nb_action_detail_order";
            Constants.TBL_ACTION_TYPE_DEFINITION = "sn_nb_action_type_definition";
            Constants.TBL_ACTION_INPUT_GENERATOR = "sn_nb_action_input_generator";
            Constants.TBL_CONDITIONAL_RULE = "sn_nb_action_conditional_rule";
            Constants.TBL_CONDITION_BASED_RULE = "sn_nb_action_condition_based_rule";
            Constants.TBL_ACTION_CONTEXT = "sn_nb_action_context";
            Constants.TBL_DECISION_TABLE_RULE = "sn_nb_action_decision_table_rule";
            Constants.TBL_RULE_BASE = "sn_nb_action_rule_base";
            Constants.TBL_RULE_CONTEXT = "sn_nb_action_rule_context";
            Constants.TBL_DECISION_TABLE = "sys_decision";
            Constants.TBL_SYS_DB_OBJECT = "sys_db_object";
            Constants.TBL_SYS_DICTIONARY = "sys_dictionary";
            Constants.TBL_DECISION_INPUT = "sys_decision_input";
            Constants.TBL_RECOMMENDED_ACTIONS = "sn_nb_action_recommended_action";
            Constants.TBL_SYS_SCRIPT_INCLUDE = "sys_script_include";
            Constants.TBL_RESOURCE_GENERATOR = "sn_nb_action_resource_generator";
            Constants.TBL_DECISION_TREE_NODE = "ga_decision_tree_node";
            Constants.TBL_DECISION_TREE = "ga_decision_tree";
            Constants.TBL_GUIDANCE = "ga_guidance";
            Constants.TBL_FIELD_RECOMMENDATION_DEFINITION = "sn_nb_action_field_recommendation_definition";
            Constants.TBL_FIELD_RECOMMENDATION = "sn_nb_action_field_recommendation";
            Constants.TBL_FLOW_OUTPUT = "sys_hub_flow_output";
            Constants.TBL_EXTENSION_INSTANCE = "sys_extension_instance";
            Constants.TBL_GENERATOR_TYPE_INPUT = "sn_nb_action_generator_type_input";
            Constants.TBL_TREND_DEFINITION = "sn_nb_action_trend_definition";
            Constants.TBL_CONTEXT_GROUP = "sn_nb_action_rule_context_group";
            Constants.TBL_CONTEXT_GROUP_STRATEGY = "sn_nb_action_rule_context_group_strategy";
            Constants.TBL_SEARCH_FILTER = "sys_search_filter";
            Constants.TBL_SORT_OPTION = "sys_search_sort_option";
            Constants.TBL_SEARCH_RESULT_RA_MAPPING = "sn_nb_action_search_result_ra_mapping";
            Constants.TBL_SEARCH_PROFILE_GENIUS_RESULT_MAPPING = "ais_search_profile_ais_genius_result_configuration_m2m";
            Constants.TBL_GENIUS_RESULT_CONFIGURATION = "ais_genius_result_configuration";
            Constants.TBL_SYS_SEARCH_GENIUS_RESULT_MODEL = "sys_search_genius_result_model";
            Constants.TBL_CONTEXT_INPUT = "sn_nb_action_context_input";

            Constants.TBL_SEARCH_SOURCE = "ais_search_source";
            Constants.TBL_SEARCH_CONTEXT_CONFIG = "sys_search_context_config";
            Constants.TBL_AIS_SEARCH_PROFILE_AIS_SEARCH_SOURCE_M2M = "ais_search_profile_ais_search_source_m2m";

            // Field Names
            Constants.COL_ACTIVE = "active";
            Constants.COL_SYS_ID = "sys_id";
            Constants.COL_ACTION = "action";
            Constants.COL_ACTION_INPUT = "action_input";
            Constants.COL_ACTION_INPUTS = "action_inputs";
            Constants.COL_ACTION_INPUT_GENERATOR = "action_input_generator";
            Constants.COL_ACTION_LABEL = "action_label";
            Constants.COL_ACTION_TYPE = "action_type";
            Constants.COL_APPLIES_TO_CHILD_TABLES = "applies_to_child_table";
            Constants.COL_API_NAME = "api_name";
            Constants.COL_ATTRIBUTE = "attribute";
            Constants.COL_RECOMMENDATION_PREFERENCE = "recommendation_preference";
            Constants.COL_RECOMMENDATION_METHOD = "recommendation_method";
            Constants.COL_CONDITION = "condition";
            Constants.COL_CONFIDENCE = "confidence";
            Constants.COL_CONFIDENCE_THRESHOLD_FOR_DIRECT_ASSIGNMENT = "confidence_threshold_for_direct_assignment";
            Constants.COL_CONTEXT = "context";
            Constants.COL_CONTEXT_TABLE = "context_table";
            Constants.COL_DECISION_TABLE = "decision_table";
            Constants.COL_SET_ACTION_INPUTS_DYNAMICALLY = "set_action_inputs_dynamically";
            Constants.COL_DESCRIPTION = "description";
            Constants.COL_DOCUMENT = "document";
            Constants.COL_FIELD = "field";
            Constants.COL_FIELD_RECOMMENDATION = "field_recommendation";
            Constants.COL_FIELD_AFF_RULE = "fields_affecting_this_rule";
            Constants.COL_GENERATOR_INPUT = "flow_input_value";
            Constants.COL_ID = "id";
            Constants.COL_INPUT_GENERATOR_FLOW = "input_generator_flow";
            Constants.COL_INTERNAL_NAME = "internal_name";
            Constants.COL_INTER_ORDER = "inter_order";
            Constants.COL_INTRA_ORDER = "intra_order";
            Constants.COL_MODEL_ID = "model_id";
            Constants.COL_MODEL_FIELD = "model_field";
            Constants.COL_MODEL_TABLE = "model_table";
            Constants.COL_NAME = "name";
            Constants.COL_NEXT_BEST_ACTION = "next_best_action";
            Constants.COL_NUMBER = "number";
            Constants.COL_ORDER = "order";
            Constants.COL_RECOMMEND = "recommend";
            Constants.COL_RECOMMENDATION_MESSAGE = "recommendation_message";
            Constants.COL_RECOMMENDATION_TYPE = "recommendation_type";
            Constants.COL_RECOMMENDED = "recommended";
            Constants.COL_RECOMMENDED_VALUE = "recommended_value";
            Constants.COL_RULE_CONTEXT = "rule_context";
            Constants.COL_REFRESH_INTERVAL = "refresh_interval";
            Constants.COL_REFRESHED_ON = "refreshed_on";
            Constants.COL_REFRESHED_ON_FIELD_TYPE = "refreshed_on_field_type";
            Constants.COL_RENDERER = "renderer";
            Constants.COL_ROLES = "roles";
            Constants.COL_RULE = "rule";
            Constants.COL_SCOPE = "scope";
            Constants.COL_SET_FIELD_TO_RECOMMENDED_VALUE = "set_field_to_recommended_value";
            Constants.COL_STATE = "state";
            Constants.COL_SYS_CLASS_NAME = "sys_class_name";
            Constants.COL_CREATED_BY = "sys_created_by";
            Constants.COL_SYS_CREATED_ON = "sys_created_on";
            Constants.COL_SYS_ID = "sys_id";
            Constants.COL_SYS_SCOPE = "sys_scope";
            Constants.COL_TABLE = "table";
            Constants.COL_TABLE_NAME = "table_name";
            Constants.COL_TAG = "tag";
            Constants.COL_ICON = "icon";
            Constants.COL_TITLE = "title";
            Constants.COL_USER = "user";
            Constants.COL_SYS_UPDATED_ON = "sys_updated_on";
            Constants.COL_ANSWER_TABLE = "answer_table";
            Constants.COL_MODEL = "model";
            Constants.COL_INTERNAL_TYPE = "internal_type";
            Constants.COL_REFERENCE = "reference";
            Constants.COL_RECOMMENDATION_HINT = "recommendation_hint";
            Constants.COL_RESOURCE_GENERATOR = "resource_generator";
            Constants.COL_ELEMENT = "element";
            Constants.COL_LABEL = "label";
            Constants.COL_SORT_OPTION_LABEL = "gui_label";
            Constants.COL_SCRIPT_INCLUDE = "script_include";
            Constants.COL_POINT = "point";
            Constants.COL_REFRESH_INTERVAL = "refresh_interval";
            Constants.COL_MAX_AGE = "max_age";
            Constants.COL_GENERATOR_TYPE = "generator_type";
            Constants.COL_GENERATOR = "generator";
            Constants.COL_HANDLER = "handler";
            Constants.COL_GENERATOR_INPUT_VARS = "generator_input";
            Constants.COL_MODEL_INPUT_TABLE = "model_input_table";
            Constants.COL_USE_CUSTOM_MODEL = "use_custom_model";
            Constants.COL_TYPE = "type";
            Constants.COL_INPUT_TABLE = "input_table";
            Constants.COL_THRESHOLD = "threshold";
            Constants.COL_COMMON_VALUE_FIELD = "common_value_field";
            Constants.COL_REFERENCE_TABLE = "reference_table";
            Constants.COL_INPUT_FIELD = "input_field";
            Constants.COL_COMMON_REFERENCE_FIELD = "common_reference_field";
            Constants.COL_CONDITION_BUILDER = "condition_builder";
            Constants.COL_PARENT_RA_ID = "recommendation_hash";
            Constants.COL_CONTEXT_DOCUMENT_ID = "context.document";
            Constants.COL_RECOMMENDATION = "recommendation";
            Constants.COL_CONTEXT_GROUPS = "context_group";
            Constants.COL_GROUPING_STRATEGY = "grouping_strategy";
            Constants.COL_SEARCH_SOURCE_TABLE = "search_source_table";
            Constants.COL_SEARCH_CONTEXT_CONFIG = "search_context_config";
            Constants.COL_SEARCH_APPLICATION_CONFIGURATION = "search_application_configuration";
            Constants.COL_DATASOURCE = "datasource";
            Constants.COL_SEARCH_PROFILE = "search_profile";
            Constants.COL_MAP_PARENT_CONTEXT = "map_parent_context";
            Constants.COL_INHERIT_EXCLUSIONS_FROM_PARENT_CONTEXT = "inherit_exclusions_from_parent_context";
            Constants.COL_ASYNCHRONOUS_EVALUATION = 'asynchronous_evaluation';
            Constants.COL_CONTEXT_INPUTS = "context_inputs";
            Constants.COL_ADVANCED_CONDITION = "advanced_condition";
            Constants.COL_EXCLUDED_FIELDS = "excluded_fields";



            Constants.COL_USE_CASE = 'use_case';

            Constants.COL_MAP_GENIUS_RESULT = 'map_genius_result';

            Constants.COL_PROFILE = "profile";
            Constants.COL_GENIUS_RESULT_CONFIG = 'genius_result_configuration';
            Constants.COL_AIS_GENIUS_CONFIG = "ais_genius_config";


            // Field Types
            Constants.FIELD_TYPE_REFERENCE = "reference";

            // Extension Points
            Constants.EXT_ACTION_TYPE_FACTORY = "ActionTypeFactory";
            Constants.EXT_RULE_TYPE_FACTORY = "RuleTypeFactory";
            Constants.EXT_SCRIPTING_GENERATOR_FACTORY = "ScriptingGeneratorFactory";
            Constants.EXT_GENERATOR_TYPE_FACTORY = "GeneratorTypeFactory";
            Constants.EXT_GROUPING_STRATEGY = "GroupingStrategy";
            // State
            Constants.STATE_NEW = "new";
            Constants.STATE_READY = "ready";
            Constants.STATE_IN_USE = "in_use";
            Constants.STATE_IN_PROGRESS = "in_progress";
            Constants.STATE_SKIPPED = "skipped";
            Constants.STATE_COMPLETED = "completed";
            Constants.STATE_IN_ERROR = "in_error";
            Constants.STATE_IGNORED = "ignored";
            Constants.STATE_ERROR_SKIPPED = "error_skipped";
            Constants.STATES_CONTEXT = [
                "new",
                "ready",
                "in_use",
                "cancelled",
                "completed"
            ];
            Constants.STATES_ACTION_DETAIL = [
                "new",
                "in_progress",
                "completed",
                "skipped",
                "ignored",
                "in_error",
                "error_skipped"
            ];
            //Evaluation Status
            Constants.EVALUATION_STATUS_COMPLETED = "completed";
            Constants.EVALUATION_STATUS_RUNNING = "running";
            Constants.EVALUATION_STATUS_WAITING = "waiting";
            Constants.EVALUATION_STATUS_REFRESH_REQUESTED = "refresh_requested";
            // Inputs
            Constants.INPUT_START_CONTEXT = "context";
            Constants.INPUT_START_CONTEXT_USER = "u_context";
            // Properties
            Constants.PROP_LOG_LEVEL = "sn_nb_action.log_level";
            Constants.PROP_DEBUG_FLOW = "sn_nb_action.debug_flow";
            // Values
            Constants.VAL_REFERENCE = "reference";
            Constants.VAL_OUTPUT = "output";
            Constants.VAL_CONTEXTUAL_SIDE_PANEL = "contextual_side_panel";
            Constants.VAL_FIELD_RECOMMENDATIONS = "field_recommendations";
            Constants.VAL_SIDE_PANEL_RECOMMENDATIONS = "side_panel_recommendations";
            Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION = "4707d44fa32701103953792e16fcda1b";

            // System Properties
            Constants.RULE_ORDER_WEIGHT = "sn_nb_action.rule_order_weight";
            Constants.RECOMMENDATION_ORDER_WEIGHT = "sn_nb_action.recommendation_order_weight";
            Constants.FREQUENCY_WEIGHT = "sn_nb_action.frequency_weight";

            // Types
            Constants.TYPE_REFERENCE = "reference";
            Constants.TYPE_STRING = "string";

            // Generator Variables
            Constants.IS_VALID_FUNCTION = "isValid";
            Constants.GET_OUTPUT_SCHEMA_FUNCTION = "getOutputSchema";
            Constants.GET_OUTPUTS_FUNCTION = "getOutputs";
            Constants.RESULT_EVALUATOR_VARIABLE = "result";
            Constants.PARAM_EVALUATOR_VARIABLE = "param";
            Constants.STATUS_EXCEPTION = "exception";
            Constants.STATUS_ERROR = "error";
            Constants.STATUS_SUCCESS = "success";
            Constants.ERROR_CODE = "errorCode";
            Constants.ERROR_MESSAGE = "errorMessage";
            Constants.ERROR_405 = "405";
            Constants.RA_PERFORMED_MESSAGE = gs.getMessage("This action is no longer available.");

            Constants.pillPickerVars = {
                NAME: "name",
                LABEL: "label",
                TYPE: "type",
                FILTERABLE: "filterable",
                DISABLED: "disabled",
                REFERENCE: "reference",
                REFERENCE_TABLE: "referenceTable",
                REFERENCE_DISPLAY_FIELD: "reference_display_field",
                LINK: "link",
                DOT: "dot",
                TABLE: "table",
                TABLE_LABEL: "table_label",
                SYS_ID: "sys_id",
                COLUMNS: "columns",
                CONTEXT_RECORD_KEY: "vp_context",
                CONTEXT_RECORD_LABEL: "Context",
                GENERATOR_OUTPUT_KEY: "vp_flow_outputs",
                RESOURCE_GENERATOR_OUTPUT_LABEL: "Resource generator",
                INPUT_GENERATOR_OUTPUT_LABEL: "Outputs",
                BASE_REFERENCE_LINK: "/api/now/em/meta/",
                RESOURCE_GENERATOR_OUTPUT_IDENTIFIER_TABLE: "sn_nb_action_resource_generator_output",
                BASE_ELEMENTS: "base_elements",
                RESOURCE_GENERATOR_OUTPUT_ELEMENTS: "resource_generator_output_elements",
                INPUT_GENERATOR_OUTPUT_ELEMENTS: "input_generator_output_elements",
                FIELD_RECOMMENDATION_INPUT_KEY: "fi",
                FIELD_RECOMMENDATION_INPUT_LABEL: "Field recommendation inputs",
                FIELD_RECOMMENDATION_INPUT_ELEMENTS: "field_recommendation_input_elements",
                GENIUS_RESULT_OUTPUT_KEY: "genius_result",
                GENIUS_RESULT_OUTPUT_LABEL: "Genius result",
                GENIUS_RESULT_OUTPUT_IDENTIFIER_TABLE: "genius_result_output_elements",
                GENIUS_RESULT_OUTPUT_ELEMENTS: "genius_result_output_elements",
                CONTEXT_INPUT_KEY: "ci",
                CONTEXT_INPUT_LABEL: "Context Inputs",
                CONTEXT_INPUT_ELEMENTS: "context_input_elements",

            };

            // Field recommendation keys
            Constants.RECOMMENDATION_MESSAGE = "recommendationMessage";
            Constants.RECOMMENDED_VALUE = "recommendedValue";
            Constants.RECOMMENDED_VALUE_SYS_ID = "recommendedValueSysId";
            Constants.IS_CONFIDENT = "isConfident";
            Constants.CONFIDENCE = "confidence";
            Constants.VALUE = "value";
            Constants.DISPLAY_VALUE = "displayValue";
            Constants.STAMP_DETAILS = "stampDetails";


            // Field recommendation defintion - Recommendation Method choices
            Constants.CHOICE_NO_AUTOFILL = "1";
            Constants.CHOICE_AUTOFILL_USING_CONFIDENCE = "2";
            Constants.CHOICE_AUTOFILL_USING_RESOURCE_GENERATOR = "3";

            // Trend Types
            Constants.TREND_TYPE_GROUP_BY_VALUE = "group_by_value";
            Constants.TREND_TYPE_GROUP_BY_REFERENCE = "group_by_reference";
            Constants.TREND_TYPE_COMMON_CONDITION = "common_condition";

            // Trend Data Variables
            Constants.TREND_DATA_COUNT = "count";
            Constants.TREND_DATA_OLDEST_RECORD = "oldestRecord";
            Constants.TREND_DATA_HIGHEST_CONFIDENCE_RECORD = "highestConfidenceRecord";
            Constants.TREND_DATA_DISPLAY_VALUE = "displayValue";
            Constants.TREND_DATA_VALUE = "value";
            Constants.TREND_DATA_SOURCE_RECORD = "sourceRecord";
            Constants.QUALIFIED_RECORD_IDS = "qualifiedRecordIds";

            Constants.VAR__M_SYS_HUB_FLOW_OUTPUT_PREFIX = "var__m_sys_hub_flow_output_";
            Constants.SYS_META = "sys_meta";
            Constants.VAR__M_SN_NB_ACTION_FIELD_RECOMMENDATION_INPUT_PREFIX = "var__m_sn_nb_action_field_recommendation_input_";
            Constants.VAR__M_SN_NB_ACTION_CONTEXT_INPUT_PREFIX = "var__m_sn_nb_action_context_input_";
            Constants.IS_ACTION_ALLOWED = "isActionAllowed";
            Constants.ERROR_MESSAGE = "errorMessage";

            Constants.DEFAULT_REFRESH_INTERVAL = 43200;
            Constants.MINIMUM_REFRESH_INTERVAL = 600;
            Constants.ASYNC_RA_TIMEOUT_PROPERTY = "sn_nb_action.async_ra_timeout";

            Constants.evaluatorVariable = {
                PARAM: 'param',
                RESULT: 'result',
                INPUTS: 'inputs',
                CONTEXT_RECORD: 'contextRecord',
                CONFIDENCE: 'confidence',
                CONFIDENCE_INTERNAL: '__confidence',
                GENERATOR_RECORD: 'generatorRecord',
                RESOURCE_GENERATOR_RECORD: 'resourceGeneratorRecord',
                SCHEMA: 'schema',
                SEARCH_TERM: 'searchTerm',
                SEARCH_FILTER: 'searchFilter',
                RULE_CONTEXT: 'ruleContext',
                PAGINATION_TOKEN: 'paginationToken',
                FACET_FILTERS: 'selectedFacetFilters',
                TOP_N_RESULTS: 'top_n_results',
                SORT_FILTER: 'selectedSortFilter',
                SHOULD_LOG_SIGNAL: 'shouldLogSignals'
            };

            Constants.STATUS = 'status';
            Constants.EVALUATOR_RECORD_SYS_ID = '3aab6eb777a7011020da364c7d5a9950';

            Constants.FLOW_TYPE_SUBFLOW = 'subflow';

            Constants.GENERATOR_TYPE_SYS_ID = {
                SCRIPTING: "d17b2845a39b01100f6357fc26fcda5d",
                DECISION_TABLE: "0caf16c6532301107234ddeeff7b12a3",
                FLOW: "9ac9cdd153530110e530ddeeff7b1228",
                AI_SEARCH: "476f19bd53143110f67eddeeff7b1209"
            };

            Constants.STRING_WHITESPACE = ' ';
            Constants.STRING_EMPTY = '';

            // Choice list types for Use Case field
            Constants.CHOICE_USE_CASE_RA = 'RA';
            Constants.CHOICE_USE_CASE_SEARCH = 'Search';
            Constants.CHOICE_YES = 'yes';
            Constants.CHOICE_NO = 'no';

            // AI search generator outputs
            Constants.SEARCH_RESULT_OUTPUT_NAME = 'search_result';
            Constants.SEARCH_RESULT_OUTPUT_LABEL = 'Search result';
            Constants.SEARCH_OUTPUT_TYPE_STRING = 'string';
            Constants.SEARCH_OUTPUT_TYPE_REFERENCE = 'reference';
            Constants.SEARCH_OUTPUT_TYPE_JSON = 'json';
            Constants.SEARCH_TEASER_TEXT_NAME = 'search_teaser_text';
            Constants.SEARCH_TEASER_TEXT_LABEL = 'Search teaser text';
            Constants.SEARCH_RESULT_TABLE_NAME = 'search_result_table';
            Constants.SEARCH_RESULT_TABLE_LABEL = 'Search result table';
            Constants.SEARCH_RESULT_SYSID_NAME = 'search_result_sysId';
            Constants.SEARCH_RESULT_SYSID_LABEL = 'Search result sysId';
            Constants.SEARCH_RESULT_TITLE_NAME = 'search_result_title';
            Constants.SEARCH_RESULT_TITLE_LABEL = 'Search result title';
            Constants.SEARCH_RESULT_PREVIEW_NAME = 'search_result_preview';
            Constants.SEARCH_RESULT_PREVIEW_LABEL = 'Search result preview fields';
            Constants.SEARCH_RESULT_URL_NAME = 'search_result_url';
            Constants.SEARCH_RESULT_URL_LABEL = 'Search result url';
            Constants.SEARCH_RESULT_DOCUMENT_INDEX = 'search_result_doc_index';
            Constants.SEARCH_RESULT_AIS_DOC_ID = 'search_result_doc_id';
            Constants.SEARCH_RESULT_NUMBER = 'search_result_number';
            Constants.ALL = "All";

            Constants.MODEL_ID = 'modelId';
            Constants.AI_SEARCH_TEASER_TEXT = 'ai_search_teaser_text';
            Constants.VAR__M_SYS_SEARCH_RESULT_GENIUS_RESULT_FIELD_PREFIX = 'var__m_sys_search_genius_result_field_';
            Constants.DEFAULT_SEARCH_FIELD = 'default_search_field';

            Constants.CONTEXT_TABLE_INPUT = 'context_table';
            Constants.RECOMMENDED_CHOICE_LABEL = 'recommendedLabel';
            Constants.SYS_CHOICE_TABLE = 'sys_choice';
            Constants.LANGUAGE = 'language';

            Constants.RECOMMENDATION_REQUESTED_EVENT = 'sn_nb_action.recommendation_requested';
            Constants.RECOMMENDATIONS_QUEUE_PREFIX = 'sn_nb_action.ra_processor_queue';
            Constants.DEFAULT_QUEUES = 1;
            Constants.MAX_QUEUES = 8;
            Constants.MIN_QUEUES = 1;
            Constants.COL_RECOMMENDATION_OUTPUT = "recommendation_output";
            Constants.COL_EVALUATION_STATUS = "evaluation_status";
            Constants.EVALUATION_STATUS_CHOICES = {
                COMPLETED: "completed",
                RUNNING: "running",
                WAITING: "waiting",
                TIMED_OUT: "timed_out",
                REFRESH_REQUESTED: "refresh_requested",
            };
            Constants.SIGNAL_EVENT = {
                SEARCH_EVENT: "SEARCH_EVENT"
            };
            Constants.SIGNAL_EVENT_TYPE = {
                INFO: "INFO"
            };
