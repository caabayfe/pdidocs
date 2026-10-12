var tables = global.NLUConstants.tables;

function getTrainedModels() {
    var solutionNames;
    var aggr = new GlideAggregate(tables.ML_SOLUTION);
    aggr.addQuery('capability', 'nlu_trainer');
    aggr.addQuery('state', 'solution_complete');
    aggr.groupBy('solution_name');
    aggr.query();
    while (aggr.next()) {
        var solName = aggr.getValue('solution_name');
        solutionNames = (solutionNames ? solutionNames + ',' : '') + solName + ',' + solName.substring(3);
    }

    var gr = new GlideRecord(tables.SYS_NLU_MODEL);
    gr.addQuery('name', 'IN', solutionNames);
    gr.addQuery('oob', false);
    gr.query();
    return gr;
}

var modelGr = getTrainedModels();
var count = 0;
while (modelGr.next()) {
    try {
        var modelId = modelGr.getUniqueValue();
        var executionGr = sn_nlu_workbench.NLUConflictExecution.getLatestExecution(modelId);
        var nluModel = new global.NLUModel(modelId);
        var modelStatus = nluModel.syncStatus();
        var lastTrainedTimestamp = !gs.nil(modelStatus) && !gs.nil(modelStatus.lastTrainedOn) ?
            new GlideDateTime(modelStatus.lastTrainedOn).getValue() : null;
        if (!executionGr || (lastTrainedTimestamp > executionGr.getValue('sys_created_on'))) {
            sn_nlu_workbench.NLUConflictDefinition.analyseConflicts([modelId], executionGr && executionGr.getValue('conflict_definition'));
            count = count + 1;
        }

    } catch (e) {
        gs.error('NLU Conflict : Unable to run conflcit analysis on model with sysId {0}', modelId);
    }
}
gs.info('NLU Conflict : Conflict analysis ran on {0} models', count);
