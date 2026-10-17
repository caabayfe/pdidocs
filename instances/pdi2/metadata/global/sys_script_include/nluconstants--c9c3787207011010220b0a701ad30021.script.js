var NLUConstants = Class.create();

(function() {

    NLUConstants.constants = {
        MODEL_DEFAULT_LANG: 'en',
        MODEL_CAT_SEARCH: 'search',
        MODEL_CAT_VA: 'virtual_agent',
        MODEL_CAT_IAR: 'issue_auto_resolution',
        SOLUTION_COMPLETE: 'solution_complete',
        TABLE_VALUES_LIMIT: 1000,
        MIN_UTTERANCES_FOR_INTENT: 15,
        COPY_NAME_SUFFIX: ' Copy',
        COPY_SUFFIX_REGEX: /( Copy)([0-9]+)$/,
        LOOKUP_REGEX: /(^@|\s@)/g,
        SCHEMA_VERSION: 'NY-1',
        PREDICTION_SERVER_UNAVAILABLE: gs.getMessage('Some features may not be available because the connection to NLU Service is not available. Please try again after sometime, if the issue persists log an issue with Support'),
        SYNCHRONOUS_TRAINING_FAILURE: 'Synchronous training failed - reason:',
        VALIDATION_FAILURE: 'Validation on data failed: ',
        UTTERANCE_REGEX: /{{(.*?)}}/g,
        MAXIMUM_SYNC: 5,
        MODEL_NAME_LENGTH: 40,
        SN_NLU_DRIVER: 'global.ParloNLUAdapter',
        ENABLED_INTENTS_QUERY: 'enableISEMPTY^ORenable=true',
        NLU_ARTIFACT_NAME: 'nlu_model',
        NLU_ADMIN_ROLE: 'nlu_admin',
        DEFAULT_TEST_SET_PREFIX: 'Test set - ',
        IRRELEVANT_UTTERANCE_LIMIT: 200
    };

    // Table names:
    NLUConstants.tables = {
        SYS_USER: 'sys_user',
        SYS_APP: 'sys_app',
        SYS_SCOPE: 'sys_scope',
        STORE_APP: 'sys_store_app',
        ML_LABELED_DATA: "ml_labeled_data",
        ML_SOLUTION: 'ml_solution',
        ML_CAPABILITY_DEFINITION_BASE: 'ml_capability_definition_base',
        ML_MODEL_ARTIFACT: 'ml_model_artifact',
        M2M_SYS_NLU_INTENT_ENTITY: 'm2m_sys_nlu_intent_entity',
        M2M_SYS_NLU_MODEL_SYS_ENTITY: 'm2m_sys_nlu_model_sys_entity',
        M2M_SYS_NLU_UTTERANCE_ENTITY: 'm2m_sys_nlu_utterance_entity',
        SYS_NLU_ENTITY: 'sys_nlu_entity',
        SYS_NLU_INTENT: 'sys_nlu_intent',
        SYS_NLU_MODEL: 'sys_nlu_model',
        SYS_NLU_MODEL_STATUS: 'sys_nlu_model_status',
        SYS_NLU_SYS_ENTITY: 'sys_nlu_sys_entity',
        SYS_NLU_UTTERANCE: 'sys_nlu_utterance',
        SYS_NLU_VOCABULARY: 'sys_nlu_vocabulary',
        SYS_DICTIONARY: 'sys_dictionary',
        SYS_TRANSFORM_SCRIPT: 'sys_transform_script',
        SN_LF_TASK: 'sn_lf_task',
        OPEN_NLU_DRIVER: 'open_nlu_driver',
        CB_TOPIC: 'sys_cb_topic_language',
        SYS_LANGUAGE: 'sys_language',
        SN_LF_REQUESTED_ITEM: 'sn_lf_requested_item',
        BATCH_TEST_SET: 'nlu_batch_test_set',
        BATCH_TEST_SET_UTTERANCES: 'nlu_batch_test_utterance'
    };

    NLUConstants.ENTITY_TYPES = {
        simple: 'simple',
        list: 'list',
        pattern: 'pattern',
        system_derived: 'typed',
        open_ended: 'open_ended'
    };

    NLUConstants.MODEL_STATE_TYPES = {
        training: 'training',
        trained: 'trained',
        published: 'published',
        cloning: 'cloning',
        translating: 'translating',
        error_while_translating: 'error_while_translating',
        draft: 'draft',
        importing: 'importing'
    };

    NLUConstants.VOCAB_TYPES = {
        regular: 'regular',
        lookup: 'lookup',
        pattern: 'pattern',
        static_lookup: 'static_lookup'
    };

    NLUConstants.INTENT_ENITITY_RELATIONSHIP = {
        regular: 'regular',
        important: 'important',
        sufficient: 'sufficient'
    };

    NLUConstants.SYS_PROPS = {
        PREBUILT_VOCAB_HARDWARE: 'glide.mlpredictor.option.nlu.@lookupSources:hardware',
        PREBUILT_VOCAB_SOFTWARE: 'glide.mlpredictor.option.nlu.@lookupSources:software',
        MIGRATION_COMPLETED: 'sn_nlu_workbench.glide.nlu.migration_completed',
        ATTACHMENT_MAX_SIZE: 'com.glide.attachment.max_size',
        MAX_UTTERANCES_FOR_SYNC_TRAIN: 'glide.nlu.utterances_per_model.async_warning_upper_limit',
        MAX_INTENTS_FOR_SYNC_TRAIN: 'glide.nlu.intents_per_model.async_warning_upper_limit',
        MAX_UTTERANCES_PER_INTENT: 'glide.nlu.utterances_per_intent.value_limit',
        MAX_TABLE_LOOKUP_RECORDS: 'glide.platform_ml.api.max_nlu_lookupsource_records',
        MAX_STATIC_LOOKUP_RECORDS: 'glide.nlu.static_lookup.value_limit',
        USE_ML_LABELED_TABLE: 'glide.nlu.train.ml_labeled_table',
        OPT_MIN_LABELED_RECORDS: 'sn_nlu_workbench.glide.nlu.optimize.min_labeled_data',
        ENABLE_IAR_MODEL_CAT: 'glide.nlu.model.purpose.iar.enable',
        ACTIVE_LEARNING_MAX_RECORDS: 'glide.mlpredictor.option.nlu.activeLearning.label_candidate_table.max_response_size',
        SKIP_NO_INTENT: 'glide.mlpredictor.option.nlu.skip_no_intent'
    };

    NLUConstants.FILE_CONSTANTS = {
        FILE_EXTENSION_REGEX: /^(.+)\.([a-z]+)$/,
        VALID_FILE_TYPES: ['xlsx', 'csv', 'xls']
    };

    NLUConstants.prototype = {
        type: 'NLUConstants',
        initialize: function() {}
    };

})();
