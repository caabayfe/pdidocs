(function(context, pageParams, blockcontext) {
    var modelId = blockcontext.selectedModelDetails.modelId;
    var trainPercent = blockcontext.modelTrainingSet;
    var tuneModel = new sn_nlu_workbench.TuneModel(modelId, [], trainPercent).tuneModel();
})(context, pageParams, blockcontext);
