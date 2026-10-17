var tables = NLUWorkbenchConstants.tables;

(function() {
    var batchTestRunExecGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
    batchTestRunExecGr.query();
    while (batchTestRunExecGr.next()) {
        try {
            var testDefinition = new sn_nlu_workbench.NLUBatchTestDefinition(batchTestRunExecGr.test_run_definition);
            var testSnapshot = testDefinition.getTestSetSnapshot();
            batchTestRunExecGr.setValue('test_set_snapshot', JSON.stringify(testSnapshot));
            batchTestRunExecGr.update();
        } catch (e) {
            gs.error('Error while updating the test set snapshot in NLU_BATCH_TEST_RUN_EXECUTION table for the record ' + batchTestRunExecGr.getUniqueValue() + ' ' + e.message);
        }
    }

})();
