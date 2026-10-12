(function executeRule(current, previous /*null when async*/ ) {
    var mlDefinition = current.ml_capability_definition;
    var modelName = current.ml_capability_definition.solution_label + '';
    var mlProps = JSON.parse(mlDefinition && mlDefinition.solution_properties || {});
    var mode = mlProps.nluTrainingMode;
    if (mode === 'IntentClassifier') {
        var modelGr = global.NLUModel.getGRByName(modelName);
        if (!modelGr) return;
        var nluModel = new global.NLUModel(modelGr.getUniqueValue(), modelGr);
        nluModel.syncStatus();
    }
})(current, previous);
