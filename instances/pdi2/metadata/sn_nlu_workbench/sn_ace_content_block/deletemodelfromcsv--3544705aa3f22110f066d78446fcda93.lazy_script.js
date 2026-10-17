(function(context, pageParams, blockcontext) {

    var modelId = blockcontext.csvModelId;
    var filter = 'model=' + modelId;
    var intentCount = parseInt(sn_nlu_workbench.NLUCoreUtils.getIntentCount(filter));
    // Safe check
    if (intentCount === 0) {
        var modelGr = new GlideRecord('sys_nlu_model');
        modelGr.get(modelId);
        modelGr.query();
        modelGr.next();
        modelGr.deleteRecord();
    }

})(context, pageParams, blockcontext);
