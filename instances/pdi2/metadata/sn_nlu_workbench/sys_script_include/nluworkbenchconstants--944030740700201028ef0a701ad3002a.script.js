var NLUWorkbenchConstants = Class.create();

(function() {

    NLUWorkbenchConstants.sysProps = {
        ATTACHMENT_MAX_SIZE: 'com.glide.attachment.max_size',
        UTTERANCE_LIMIT: 'sn_nlu_workbench.glide.nlu.batch_test.max_import_rows',
        MAX_BATCH_TEST_RUNS: 'sn_nlu_workbench.glide.nlu.batchtest.max_runs',
        CONFLICT_THRESHOLD_MODERATE: 'sn_nlu_workbench.glide.nlu.conflict.moderate_threshold',
        CONFLICT_THRESHOLD_CRITICAL: 'sn_nlu_workbench.glide.nlu.conflict.critical_threshold',
        EXPORT_ESCAPE_FORMULAS: 'glide.export.escape_formulas',
        MIN_CLUSTERING_RECORDS: 'sn_nlu_workbench.glide.nlu.performance.min_clustering_records',
        OPT_MIN_LABELED_RECORDS: 'sn_nlu_workbench.glide.nlu.optimize.min_labeled_data',
        ACTIVE_LEARNING_MAX_RECORDS: 'glide.mlpredictor.option.nlu.activeLearning.label_candidate_table.max_response_size'
    };

    NLUWorkbenchConstants.tables = {
        NLU_BATCH_TEST_SET: 'nlu_batch_test_set',
        NLU_BATCH_TEST_UTTERANCE: 'nlu_batch_test_utterance',
        NLU_BATCH_TEST_RUN_DEFINITION: 'nlu_batch_test_run_definition',
        NLU_BATCH_TEST_RUN_EXECUTION: 'nlu_batch_test_run_execution',
        NLU_BATCH_TEST_RESULT: 'nlu_batch_test_result',
        NLU_CONFLICT_DEFINITION: 'nlu_conflict_definition',
        NLU_CONFLICT_EXECUTION: 'nlu_conflict_execution',
        NLU_CONFLICT_RESULT: 'nlu_conflict_result',
        NLU_OPTIMIZED_BATCH_TEST_RESULTS: 'sn_nlu_workbench_optimized_batch_test_results',
        SYS_DICTIONARY: 'sys_dictionary',
        SYS_TRIGGER: 'sys_trigger',
        SYS_ATTACHMENT: 'sys_attachment',
        SYS_TRANSFORM_MAP: 'sys_transform_map',
        SYS_IMPORT_SET: 'sys_import_set',
        SYS_IMPORT_SET_RUN: 'sys_import_set_run',
        ML_SOLUTION: 'ml_solution',
        ML_CAPABILITY_DEFINITION_BASE: 'ml_capability_definition_base',
        SYS_NLU_UTTERANCE: 'sys_nlu_utterance',
        SYS_NLU_INTENT: 'sys_nlu_intent',
        NLU_PERFORMANCE_UTTERANCE_TRACE: 'nlu_performance_utterance_trace',
        NLU_PERFORMANCE_IGNORED_CLUSTERS: 'nlu_performance_ignored_clusters',
        ML_CLUSTER_DETAIL: 'ml_cluster_detail',
        SYS_NLU_MODEL: 'sys_nlu_model',
        SYS_NLU_MODEL_STATUS: 'sys_nlu_model_status',
        SYS_SCRIPT_INCLUDE: 'sys_script_include',
        LCT: 'ml_label_candidate',
        ULT: 'ml_labeled_data',
        LABEL_USER_FEEDBACK: 'ml_label_user_feedback',
        DBVIEW_TODO_FURTHER_REVIEW: 'sn_nlu_workbench_data_labeling__utterances_todo_nfr',
        NLU_ANALYSIS_DEFINITION: 'nlu_analysis_definition',
        NLU_ANALYSIS_EXECUTION: 'nlu_analysis_execution'
    };

    NLUWorkbenchConstants.constants = {
        BASE64_PREFIX_REGEX: /.*?;base64,/,
        FILE_EXTENSION_REGEX: /^(.+)\.([a-z]+)$/,
        VALID_FILE_TYPES: ['xlsx', 'csv', 'xls'],
        DEFAULT_LANGUAGE: 'en',
        MAX_TESTS: 10000,
        MAX_EXPECTED_INTENTS: 3,
        DEFAULT_MAX_RUNS: 7
    };

    NLUWorkbenchConstants.SOLUTION_STATES = {
        TRAIN_ERROR_STATES: ['retry', 'solution_error', 'unauthorized'],
        TRAIN_TIMEOUT_STATE: 'timed_out',
        TRAIN_CANCELLED_STATE: 'solution_cancelled',
        TRAIN_SUCCESS_STATE: 'solution_complete',
        TRAIN_WAITING_STATE: 'waiting_for_training',
        TRAIN_INPROGRESS: ['training_request_received', 'fetching_files_for_training', 'preparing_data', 'training_solution', 'uploading_solution']
    };

    NLUWorkbenchConstants.EXECUTION_STATUS = {
        PREPARING: 'preparing',
        INPROGRESS: 'inprogress',
        PROCESSING_RESULTS: 'processing_results',
        REQUEST_TIMEOUT: 'request_timeout',
        SUCCESS: 'success',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
    };

    NLUWorkbenchConstants.BATCHTEST_RESULT_TYPE = {
        CURRENT: 'current',
        RECOMMENDED: 'recommended',
        OPTIMIZED: 'optimized'
    };

    NLUWorkbenchConstants.TRAINING_MODE = {
        ASYNC_BATCH: 'nlu_async_batch',
        TRAIN_OPTIMIZE: 'train_and_optimize'
    };

    NLUWorkbenchConstants.prototype = {
        initialize: function() {},
        type: 'NLUWorkbenchConstants'
    };
})();
