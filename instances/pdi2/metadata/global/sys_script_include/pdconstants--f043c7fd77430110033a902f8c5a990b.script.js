var PDConstants = Class.create();
PDConstants.prototype = {
    initialize: function() {},

    type: 'PDConstants'
};

PDConstants.TABLES = {
    PD_PROCESS_DEFINITION: 'sys_pd_process_definition',
    PD_DERIVATIVE: 'sys_pd_derivative',
    PD_SWIMLANE: 'sys_pd_swim_lane',
    PD_ACTIVITY: 'sys_pd_activity',
    PD_ACTIVITY_DEFINITION: 'sys_pd_activity_definition',
    PD_ACTIVITY_TYPE: 'sys_pd_activity_type',
	PD_ACTIVITY_TYPE_PROP: 'sys_pd_activity_type_prop',
    COLOR_CATEGORY_TABLE: 'sys_ux_theme_property',
    PD_DIAGRAM_ACTIVITY_APP_OBJECT: 'sys_pd_activity_m2m_app_object',
    PD_LANE: 'sys_pd_lane',
    PD_TRIGGER_INSTANCE: 'sys_pd_trigger_instance',
    PD_TRIGGER_DEFINITION_TABLE: 'sys_pd_trigger_definition',
    PD_TIMER_ATTRIBUTES_TABLE: 'sys_pd_timer_attributes',
    PD_ACTIVITY_ASSET_CONFIGURATION_TABLE: 'sys_pd_asset_configuration',
    PD_CONTEXT: 'sys_pd_context',
    PD_LANE_CONTEXT: 'sys_pd_lane_context',
    PD_ACTIVITY_CONTEXT: 'sys_pd_activity_context',
    ELEMENT_MAPPING: 'sys_element_mapping',
    VARIABLE_VALUE: 'sys_variable_value',
    PD_CONTEXT_LOG: 'sys_pd_context_log',
    PD_PROCESS_VARIANT: 'sys_pd_process_variant',
    FLOW_DATA: 'sys_flow_data',
    FLOW_DATA_DEFINITION: 'sys_flow_data_definition',
    FLOW_DATA_VARIABLES: 'sys_flow_data_var',
    UI_ELEMENT: 'sys_ui_element',
    UI_SECTION: 'sys_ui_section',
    PD_PROCESS_TYPE: 'sys_pd_process_type',
    PD_PROCESS_TYPE_ACTIVITY_DEFINITION_MAP: 'sys_pd_process_type_activity_definition_map',
    PD_PANEL_OVERRIDE: 'sys_pd_panel_override',
    PD_ACTIVITY_OVERRIDE: 'sys_pd_activity_override',
    PD_GENERATION_CONTEXT: 'sys_pd_generation_context',
    ATTACHMENT: 'sys_attachment',
    PD_PROCESS_INPUT: 'sys_pd_process_input',
    PD_PROCESS_OUTPUT: 'sys_pd_process_output',
    PD_SNAPSHOT_INPUT: 'sys_pd_snapshot_input',
    PD_SNAPSHOT_OUTPUT: 'sys_pd_snapshot_output',
    PD_SNAPSHOT: 'sys_pd_snapshot',
    VAR_DICTIONARY: 'var_dictionary',
    SYS_HUB_FLOW: 'sys_hub_flow',
    SYS_HUB_ACTION_TYPE_DEFINITION: 'sys_hub_action_type_definition',
    KB_KNOWLEDGE: 'kb_knowledge',
    KB_TEMPLATE_HOW_TO: 'kb_template_how_to',
    SYS_CHOICE: 'sys_choice',
    SYS_DOCUMENTATION: 'sys_documentation',
    PD_ACTIVITY_ACTION_OVERRIDE: 'sys_pd_activity_action_override',
    PE_RECORD_GENERATOR: 'sys_playbook_experience_record_generator',
    SYS_PLAYBOOK_EXECUTION: 'sys_playbook_execution'
};

PDConstants.CONTENT_FILTER_TABLES = [
    PDConstants.TABLES.PD_PROCESS_DEFINITION,
    PDConstants.TABLES.PD_ACTIVITY_DEFINITION
];

// Start Rules
PDConstants.START_RULES = {
    AFTER_ACTIVITIES: '7abaf173c35101102a86cb03b940dd62',
    IMMEDIATE: 'ef8ab8c0a3f04bceb117263f51401070',
    AFTER_LANES: '7407ca1ac3e02110f1f504186e40dd50',
    LANE_IMMEDIATELY: 'b823830967fc41ddb84959d97897b1ae',
    MANUAL: 'b4727ca5c3602010f5bfea1c8d40dda9',
};

PDConstants.START_RULE_NAMES = {
    IMMEDIATE: 'immediate',
    AFTER_ITEMS: 'after_items',
    MANUAL: 'manual'
}

// Table Field Constants
PDConstants.FIELDS = {
    SYS_META: 'sys_meta',
    SYS_ID: 'sys_id',
    DOCUMENT_KEY: 'document_key',
    SYS_SCOPE: 'sys_scope',
    LABEL: 'label',
    NAME: 'name',
    DESCRIPTION: 'description',
    SUMMARY: 'summary',
    COORDINATES: 'coordinates',
    ACTIVITY: 'activity',
    ACTION_ASSIGNMENT: 'action_assignment',
    ACTIVITY_ACTION_OVERRIDES: 'activity_action_overrides',
    DISPLAY_ORDER: 'display_order',
    ACTIVITY_DEFINITION: 'activity_definition',
    ADDITIONAL_FUNCTIONALITY: 'additional_functionality',
    ALLOW_AS_NESTED: 'allow_as_nested',
    PROCESS_DEFINITION: 'process_definition',
    START_RULE: 'start_rule',
    START_RULE_VARS: 'start_rule_vars',
    START_RULE_NAME: 'start_rule_name',
    STARTS_AFTER_LANES: 'starts_after_lanes',
    STARTS_AFTER_ACTIVITIES: 'starts_after_activities',
    STARTS_AFTER_BRANCHES: 'starts_after_branches',
    SWIM_LANE: 'swim_lane',
    LANE: 'lane',
    IMAGE: 'image',
    ORDER: 'order',
    ACTIVE: 'active',
    SYS_CREATED_ON: 'sys_created_on',
    SYS_UPDATED_ON: 'sys_updated_on',
    CONDITION: 'condition',
    CONDITION_TO_RUN: 'condition_to_run',
    START_RULE_VAR_AFTER_ACTIVITIES: 'start_rule_vars.activities',
    START_RULE_VAR_BRANCHES: 'start_rule_vars.branches',
    TARGET_TABLE: 'target_table',
    TARGET_RECORD: 'target_record',
    VIEW_TYPE: 'view_type',
    INPUTS: 'inputs',
    OUTPUTS: 'outputs',
    TYPE_VALS: 'type_vals',
    DESIGNER_STATE: 'designer_state',
    COLOR: 'color',
    ICON: 'icon',
    COLOR_CATEGORY: 'color_category',
    COLOR_CATEGORY_DISPLAY_NAME: 'display_name',
    COLOR_CATEGORY_CUSTOM_PROPERTY: 'custom_property',
    START_RULE_VAR_AFTER_LANES: 'start_rule_vars.lanes',
    TRIGGER_RECORD_DATA: 'trigger_record_data',
    TRIGGER_INPUTS: 'trigger_inputs',
    PLAYBOOK_INPUTS: 'playbook_inputs',
    TRIGGER_TYPE: 'trigger_type',
    TRIGGER_DEFINITION: 'trigger_definition',
    PROCESS_SCHEMA_VERSION: 'process_schema_version',
    SCHEMA_VERSION: 'schema_version',
    SOURCE: 'source',
    SOURCE_TYPE: 'source_type',
    ACTIVITY_TYPE: 'activity_type',
    CATEGORY: 'category',
    TYPE: 'type',
    ASSET_ID: 'assetId',
    ASSET_LABEL: 'assetLabel',
    ASSET_CONFIGURTION_ID: 'assetConfigurationId',
    TABLE: 'table',
    PARENT_RECORD: 'parent_record',
    PARENT_ACTIVITY_CONTEXT: 'parent_activity_context',
    MODEL: 'model',
    MODEL_ID: 'model_id',
    ELEMENT: 'element',
    POSITION: 'position',
    CAPTION: 'caption',
    TITLE: 'title',
    VIEW: 'view',
    VALUE: 'value',
    SEQUENCE: 'sequence',
    LANGUAGE: 'language',
    PLURAL: 'plural',
    INITIAL_DISPLAY_PREFERENCES: 'input_display_preferences',
    GENERIC_ACTIVITY_DEFININITION_LAUNCHER: 'generic_activity_definition_launcher',
    REFERENCE: 'reference',
    INTERNAL_TYPE: 'internal_type',
    STATE: 'state',
    CONTEXT: 'context',
    ID: 'id',
    RESTART_RULE: 'restart_rule',
    PROCESS_TYPE: 'process_type',
    ENABLE_STAGES: 'enable_stages',
    ENABLE_TEST_BUTTON: 'enable_test_button',
    ENABLE_OPTIONAL_ACTIVITIES: 'enable_optional_activities',
    ENABLE_DECISIONS: 'enable_decisions',
    ENABLE_ACTIVATE: 'enable_activate',
    ENABLE_DUPLICATE: 'enable_duplicate',
    ENABLE_CANVAS_VIEW: 'enable_canvas_view',
    ENABLE_ALL_ACTIVITIES: 'enable_all_activities',
    ENABLE_PUBLIC_ACCESS: 'enable_public_access',
    ACTIVITY_PICKER_OVERRIDE: 'activity_picker_override',
    ENABLE_VARIANTS: 'enable_variants',
    UI_COMPONENT: 'ui_component',
    ITEM_TYPE: 'item_type',
    PARENT_VARIANT: 'parent_variant',
    FAVORITE: 'favorite',
    FLOW_DATA_VARIABLES: 'flow_data_variables',
    DATA_DEFINITION: 'data_definition',
    VARIANT: 'variant',
    ARCHIVE: 'archive',
    PROCESS_SNAPSHOT: 'process_snapshot',
    OVERRIDE_PARENT: 'override_parent',
    STATUS: 'status',
    SNAPSHOT: 'snapshot',
    RESTARTABLE: 'restartable',
    NOW_ASSIST_PROMPT: 'now_assist_prompt',
    NOW_ASSIST_KB: 'now_assist_kb',
    RUN_ON_PAD_ENGINE: 'run_on_pad_engine',
    ENGINE_MAJOR_VERSION: 'engine_major_version',
    NOW_ASSIST_ATTACHMENT_ID: 'now_assist_attachment_id',
    NOW_ASSIST_ATTACHMENT_NAME: 'now_assist_attachment_name',
    SYNC_STATE: 'sync_state',
    GENERATION_CONTEXT_STATE_UPDATED_CALLBACK: 'state_updated_callback',
    GENERATION_CONTEXT_ERROR_CALLBACK: 'error_callback',
    GENERATION_CONTEXT_ERROR_MESSAGE: 'error_message',
    GENERATION_CONTEXT_META: 'meta',
    GENERATION_CONTEXT_ADDITIONAL_PROCESS_INFO: 'additional_process_info',
    GENERATION_CONTEXT_REQUEST_ID: 'request_id',
    GENERATION_CONTEXT_STATE: 'state',
    GENERATION_CONTEXT_PROCESS_DEFINITION: 'process_definition',
    GENERATION_CONTEXT_PROCESS_DATA: 'process_data',
    FILE_NAME: 'file_name',
    TABLE_SYS_ID: 'table_sys_id',
    TABLE_NAME: 'table_name',
    SIZE_BYTES: 'size_bytes',
    IMAGE_WIDTH: 'image_width',
    IMAGE_HEIGHT: 'image_height',
    MANDATORY: 'mandatory',
    COLUMN_LABEL: 'column_label',
    PERMISSION: 'permission',
    DEPENDENT_ON_FIELD: 'dependent_on_field',
    BADGE: 'badge',
    INPUT_DISPLAY_PREFERENCES: 'input_display_preferences',
    EXPERIENCE_DISPLAY_PREFERENCES: 'experience_display_preferences',
    ACCESS: 'access',
    TRIGGER_SETUP: 'trigger_setup',
    ENABLE_AI_AGENT: 'enable_ai_agent',
    AI_AGENT_OBJECTIVE: 'ai_agent_objective',
    AI_AGENT_AUTONOMOUS_OBJECTIVE: 'ai_agent_obj_additional_detail',
    AI_AGENT_RUN_AS: 'ai_agent_run_as',
    AI_AGENT_USER: 'ai_agent_user',
    AI_AGENT_FIELDS: 'ai_agent_fields',
    AI_AGENT_STATUS: 'ai_agent_status',
    AI_AGENT_UI_STAGING: 'ai_agent_ui_staging',
    AI_AGENT_ACTIVITY_AUTO_COMPLETE: 'ai_agent_execution_mode',
    CONVERSATIONAL_AGENTS: 'conversational_agents',
    LAUNCH_AGENT_ON_DEMAND: 'launch_agent_on_demand',
    CONVERSATION_ID: 'conversation_id',
    EXECUTION_ID: 'execution_id',
    START_RULE_NAME_AFTER_ITEMS: 'after_items',
    HINT: 'hint',
    DEFAULT_VALUE: 'default_value',
    REFERENCE_QUALIFIER: 'reference_qual',
    MAX_LENGTH: 'max_length',
    REFERENCE_QUALIFIER_CONDITION: 'reference_qual_condition',
    RUN_STRATEGY: 'run_strategy',
    RUN_STRATEGY_ON_PROCESS_DEFINITION: 'run_strategy_on_process_definition',
    EVALUATE_VARIANT_CHILDREN_AFTER: 'evaluate_variant_children_after',
    PUBLIC_ACCESS: 'public_access',
    SHORT_DESCRIPTION: 'short_description',
    KB_INTRODUCTION: 'kb_introduction',
    TEXT: 'text',
    KB_INSTRUCTIONS: 'kb_instructions',
	ASSOCIATED_RECORD: 'associated_record',
	ASSOCIATED_RECORD_TABLE: 'associated_table',
	EXECUTION_TYPE: 'execution_type',
    LAUNCHER_TITLE: 'launcher_title',
    LAUNCHER_DESCRIPTION: 'launcher_description',
    LAUNCHER_SHOW_RECORD_FORM: 'launcher_show_record_form',
    LAUNCHER_RECORD_FORM_VIEW: 'launcher_record_form_view',
    LAUNCHER_TEMPLATE_FIELDS: 'launcher_template_fields',
    LAUNCHER_INPUTS: 'launcher_inputs',
	INPUT_RECORD: 'input_record',
	INPUT_TABLE: 'input_table'
};

// used for field dotwalking to parent process definition
PDConstants.TABLE_REFERENCE_FIELD_MAP = {};
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_PROCESS_DEFINITION] = []; // parent process definition is the root
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_SNAPSHOT] = [PDConstants.FIELDS.SOURCE];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_ACTIVITY_OVERRIDE] = [
  PDConstants.FIELDS.OVERRIDE_PARENT,
  PDConstants.FIELDS.PROCESS_DEFINITION,
];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_DIAGRAM_ACTIVITY_APP_OBJECT] = [
  PDConstants.FIELDS.ACTIVITY,
  PDConstants.FIELDS.PROCESS_DEFINITION,
];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_PROCESS_INPUT] = [PDConstants.FIELDS.MODEL];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_PROCESS_OUTPUT] = [PDConstants.FIELDS.MODEL];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_SNAPSHOT_INPUT] = [
  PDConstants.FIELDS.MODEL,
  PDConstants.FIELDS.SOURCE,
];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_SNAPSHOT_OUTPUT] = [
  PDConstants.FIELDS.MODEL,
  PDConstants.FIELDS.SOURCE,
];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.FLOW_DATA_DEFINITION] = [
  PDConstants.FIELDS.PROCESS_DEFINITION,
];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.FLOW_DATA_VARIABLES] = [
  PDConstants.FIELDS.MODEL,
  PDConstants.FIELDS.PROCESS_DEFINITION,
];
PDConstants.TABLE_REFERENCE_FIELD_MAP[PDConstants.TABLES.PD_ACTIVITY_ACTION_OVERRIDE] = [
  PDConstants.FIELDS.ACTIVITY,
  PDConstants.FIELDS.PROCESS_DEFINITION
];

PDConstants.FEATURES = {
    MULTIPLE_STAGES: 'multiple_stages',
    OPTIONAL_ACTIVITIES: 'optional_activities',
    DECISIONS: 'decisions',
    VARIANTS: 'variants',
    ALL_ACTIVITIES: 'all_activities',
    PUBLIC_ACCESS: 'public_access'
};

PDConstants.FEATURES.DISPLAY_NAMES = {
    MULTIPLE_STAGES: 'multiple stages',
    OPTIONAL_ACTIVITIES: 'optional activities',
    DECISIONS: 'decisions',
    VARIANTS: 'variants',
    ALL_ACTIVITIES: 'all activities',
    PUBLIC_ACCESS: 'public access'
};

PDConstants.PROCESS_TYPE_FEATURE_NAMES = [
    'enable_activate',
    'enable_decisions',
    'enable_duplicate',
    'enable_canvas_view',
    'enable_stages',
    'enable_optional_activities',
    'enable_test_button',
    'enable_variants',
    'enable_all_activities',
    'trigger_setup',
    'activity_picker_override',
    'enable_public_access',
    'data_retention_period'
];

PDConstants.STATE_VALUES = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    IN_PROGRESS_AND_SCHEDULED: 'IN_PROGRESS_AND_SCHEDULED',
    COMPLETE: 'COMPLETE',
    SCHEDULED: 'SCHEDULED',
    SKIPPED: 'SKIPPED',
    ERROR: 'ERROR',
    CANCELLED: 'CANCELLED',
};

PDConstants.PROCESS_DEFINITION_FIELDS_WITH_BRS = [
    PDConstants.FIELDS.NAME,
    'processType'
];

PDConstants.FEEDBACK_STATE_VALUES = {
    ACCEPTED: 'Accepted'
};

PDConstants.FEEDBACK_STATE_VALUES = {
    ACCEPTED: 'Accepted'
};

PDConstants.ACTIVITY_DEFINITION_IDS = {
    DECISION: "226ed8f6c7ad5110bfbaf89f51c260b1",
    PLACEHOLDER: "ceac99e01b3f0010affd0e55cc4bcb83",
    QUESTIONNAIRE: "cdb5cd6f777b71106ed97a8c8c5a9957",
    LAUNCH_NESTED_PLAYBOOK: "cddfddbaa3d4f610ea7f10c4141e618e"
};

PDConstants.ADDITIONAL_FUNCTIONALITY_TYPE = {
    DECISION: "internal",
    PLACEHOLDER: "placeholder",
    QUESTIONNAIRE: "questionnaire"
};

PDConstants.RAW_ASSETS = {
    TYPE_RAW_ASSET: 'AUTOMATION_ASSET',
    TYPE_ACTIVITY_DEFINITION: 'ACTIVITY_DEFINITION',
    ACTIVITY_DEFINITION_CATEGORY: 'b51cee574320311089db5fb208b8f269',
    TABLE_ACTION: PDConstants.TABLES.SYS_HUB_ACTION_TYPE_DEFINITION,
    TABLE_ACTION_INPUT: 'sys_hub_action_input',
    TABLE_FLOW: PDConstants.TABLES.SYS_HUB_FLOW,
    TABLE_FLOW_INPUT: 'sys_hub_flow_input',
    INPUT_TYPE_REFERENCE: 'reference',
    RAW_ACTIVITY_DEFINITION_FIELD: 'activityDefinition'
};

PDConstants.UDC_FILE_TAXONOMY = {
    BUILDER_CONFIG_TABLE: 'sn_udc_file_taxonomy_builder_config',
    BUILDER_CONFIG_ID: '2ddd95c737500210c377d8d734924ba6',
    CREATE_PATH_FIELD: 'create_path',
    EDIT_PATH_FIELD: 'edit_path'
};

PDConstants.ATTACHMENT = {
    REDUCTION_RATIO: 0.8,
    MIN_SIZE_IN_BYTES: 1048576,
    MAX_WIDTH_OR_HEIGHT: 2048
};

PDConstants.MISC = {
    PREFIX_ZZ_YY: 'ZZ_YY',
    ACTIVITY_HYDRATION: 'ACTIVITY_HYDRATION',
    PLAYBOOK_SEMANTIC_SEARCH_ACTION: 'global.now_assist_for_playbook_assets_search',
    ASSET_CONFIGURATION_IDS: {
        'FLOWS': 'de5a6d53431131101d0cb48989b8f2a1',
        'ACTIONS': 'e80aad53431131101d0cb48989b8f2c6',
        'SUBFLOWS': 'c74b25d3431131101d0cb48989b8f292'
    }
};

PDConstants.ENABLE_AGENTIC_PLAYBOOK = 'sn_pa_designer.enable_agentic_playbooks';
PDConstants.LAUNCH_ON_DEMAND_FIELDS = 'sn_pa_designer.playbook_on_demand_agent_fields';
PDConstants.AUTHORISED_ACTION_COMPLETE = 'complete';
PDConstants.SUCCESS = 'success';
PDConstants.FAILURE = 'failure';
PDConstants.PLAYBOOK_ACTIVITY_ASSIST_USECASE = 'ca1fb16f37b4221079a7c4f734924b20';
PDConstants.ALLOWED_AGENT_IDS = [
    '14e13056ff0d26108d35ffffffffffb1',
    'b7865b713741661079a7c4f734924b90'
];
PDConstants.AI_AGENT_STATUS = {
    COMPLETED: 'COMPLETED',
    IDLE: 'IDLE',
    CANCELLED: 'CANCELLED'
};

PDConstants.AI_AGENT_ACTIVITY_AUTO_COMPLETION_MODE = {
    ON: 'on',
    OFF: 'off'
};

PDConstants.PLAYBOOK_TYPES = {
    'CREATOR_STUDIO_AUTOMATION': 'a487710eff0f3110893effffffffff4d'
};

PDConstants.PARENT_RECORD_INPUT = {
    value: '',
    variableValue: '',
    defaultValue: '',
    displayValue: 'Parent Record',
    internalType: 'reference',
    label: 'Parent Record',
    variableName: PDConstants.FIELDS.PARENT_RECORD,
    glideVarElement: PDConstants.FIELDS.PLAYBOOK_INPUTS,
    reference: '',
    referenceQualifier: '',
    hint: '',
    maxLength: 32,
    canRead: true,
    canWrite: true,
    isMandatory: false,
    order: 0
};

PDConstants.DEFAULT_TRIGGER_RECORD_PILL = '{{triggerRecord}}';
PDConstants.DEFAULT_RUN_STRATEGY = 'run_once';

PDConstants.EXECUTION_TYPES = {
    RECORD_DRIVEN: 'record_driven',
    ON_DEMAND: 'on_demand'
};

PDConstants.MINIMUM_RETENTION_PERIOD = 14; //days
PDConstants.DEFAULT_RETENTION_PERIOD_CHOICE = '6_week';

// Pre-populated for newly created form-based activity definitions so designers
// don't have to write instructions from scratch (see STRY64817544). Matches the
// ai_agent_objective value already shipped on OOB form-based activity
// definitions (e.g. user_form, create_task_1).
PDConstants.DEFAULT_AI_AGENT_OBJECTIVE = 'Complete this form using the data available in playbook parent record, available attachments and outputs from previous activities.';

// The category sys_id used to mark a non-interactive activity definition (e.g. a subflow
// or script action with no UI of its own). Shared by PDActivityDefinitionRepository.isFormBased()
// and its tests so the id has a single source of truth.
PDConstants.NON_INTERACTIVE_CATEGORY_SYS_ID = '5db890441bff0010affd0e55cc4bcb2b';

// The set of operations an AI agent can extract from an activity's instructions and execute
// against sys_pd_activity_context (see PDAIAgentUtils::_attemptCompleteActivity). This is the
// backend's canonical list — the ai_agent's tool schema enum (sn_aia_agent
// b7865b713741661079a7c4f734924b90) and the ai_agent_supported_actions choice list on
// sys_pd_activity_definition are configured separately and must be kept in sync with this list.
PDConstants.OPERATION_TYPES = {
    UPDATE_RECORD: 'update_record',
    CREATE_RECORD: 'create_record',
    MARK_COMPLETE: 'mark_complete'
};

PDConstants.OPERATION_TYPES_LIST = [
    PDConstants.OPERATION_TYPES.UPDATE_RECORD,
    PDConstants.OPERATION_TYPES.CREATE_RECORD,
    PDConstants.OPERATION_TYPES.MARK_COMPLETE
];
