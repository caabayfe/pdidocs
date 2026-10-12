(function executeRule(current, previous /*null when async*/ ) {

    insertModelStatus(current.getValue('sys_id'));
    var parloIntegrator = new NLUParloIntegrator(current);
    var version = parloIntegrator.getModelVersion(parloIntegrator.getSolution());
    var supportedEntities = NLUParloIntegrator.getSupportedSystemEntities(current.getValue('language'), version);
    var model = new NLUModel(current.getUniqueValue());
    supportedEntities.forEach(function(name) {
        model.enableSysEntity(name);
    });
})(current, previous);


function insertModelStatus(modelId) {
    var modelStatusRec = new GlideRecord('sys_nlu_model_status');
    modelStatusRec.setValue('model', modelId);
    modelStatusRec.setValue('dirty', true);
    modelStatusRec.insert();
}
