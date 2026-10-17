(function executeRule(current, previous /*null when async*/ ) {

    var nluModel = new global.NLUModel(current.model);
    var modelGr = nluModel.getGR();
    var modelId = modelGr.getUniqueValue();

    //Trigger conflict report
    if (!modelGr.oob) {
        var executionGr = sn_nlu_workbench.NLUConflictExecution.getLatestExecution(modelId);
        sn_nlu_workbench.NLUConflictDefinition.analyseConflicts([modelId], executionGr && executionGr.getValue('conflict_definition'));
    }

})(current, previous);
