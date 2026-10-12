(function executeRule(current, previous /*null when async*/ ) {

    var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;
    var SOLUTION_STATES = sn_nlu_workbench.NLUWorkbenchConstants.SOLUTION_STATES;
    var EXECUTION_STATUS = sn_nlu_workbench.NLUWorkbenchConstants.EXECUTION_STATUS;

    var testExecution;
    try {
        // Get the execution record: 
        var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
        if (executionGr.get('solution', current.sys_id)) {
            testExecution = new sn_nlu_workbench.NLUBatchTestExecution(null, executionGr);
            var status = current.getValue('state');

            if (status === SOLUTION_STATES.TRAIN_SUCCESS_STATE) {
                testExecution.updateStatus(EXECUTION_STATUS.PROCESSING_RESULTS);
                sn_nlu_workbench.NLUBatchTestResultsProcessor.processInBackground(testExecution.getId());
            } else if (status === SOLUTION_STATES.TRAIN_TIMEOUT_STATE) {
                testExecution.updateStatus(EXECUTION_STATUS.REQUEST_TIMEOUT);
            } else if (SOLUTION_STATES.TRAIN_ERROR_STATES.indexOf(status) !== -1) {
                testExecution.updateStatus(EXECUTION_STATUS.FAILED);
            } else if (status === SOLUTION_STATES.TRAIN_CANCELLED_STATE) {
                testExecution.updateStatus(EXECUTION_STATUS.CANCELLED);
            }
        }
    } catch (ex) {
        gs.error('Failed to process batch test results: ' + ex.message);
        testExecution && testExecution.updateStatus(EXECUTION_STATUS.FAILED);
    }

})(current, previous);
