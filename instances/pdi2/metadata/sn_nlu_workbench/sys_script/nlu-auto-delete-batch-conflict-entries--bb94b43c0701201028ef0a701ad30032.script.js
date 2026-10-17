(function executeRule(current, previous /*null when async*/ ) {

    var modelId = current.getUniqueValue();

    var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;

    var batchTestGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_DEFINITION);
    batchTestGr.addEncodedQuery('modelsLIKE' + modelId);
    batchTestGr.query();
    batchTestGr.deleteMultiple();

    var conflictGr = new GlideRecord(tables.NLU_CONFLICT_DEFINITION);
    conflictGr.addEncodedQuery('modelsLIKE' + modelId);
    conflictGr.query();
    conflictGr.deleteMultiple();

})(current, previous);
