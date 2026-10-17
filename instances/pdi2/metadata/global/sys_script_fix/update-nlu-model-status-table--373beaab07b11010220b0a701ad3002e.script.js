var tables = NLUConstants.tables;

function updateModelStateDict() {
    var dictGr = new GlideRecord(tables.SYS_DICTIONARY);
    dictGr.addQuery('name', tables.SYS_NLU_MODEL);
    dictGr.addQuery('element', 'state');
    dictGr.query();
    if (dictGr.next()) {
        dictGr.setValue('calculation', 'var nluModel = new global.NLUModel(current.sys_id);current.state = nluModel.getState();');
        dictGr.update();
        gs.info('NLU Model: Upgraded state virtual column');
    }
}

function updateEntityDict() {
    var dictGr = new GlideRecord(tables.SYS_DICTIONARY);
    dictGr.addQuery('name', tables.SYS_NLU_ENTITY);
    dictGr.addQuery('element', 'field_name');
    dictGr.query();
    if (dictGr.next()) {
        dictGr.setValue('internal_type', 'string');
        dictGr.setValue('max_length', '100');
        dictGr.setValue('dependent_on_field', '');
        dictGr.update();
        gs.info('NLU Entity: Upgraded field_name column details');
    }
}

(function() {

    var modelId, modelGr, parloIntegrator, result, lastPublishedOrTrained, modelUpdatedOn;

    updateModelStateDict();
    updateEntityDict();

    var gr = new GlideRecord(tables.SYS_NLU_MODEL_STATUS);
    gr.query();
    while (gr.next()) {
        modelId = gr.getValue('model');
        modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
        if (!modelGr.get(modelId)) {
            gs.info('NLU Model: ' + modelId + ' - ERROR: nlu_model record does not exist!');
            continue;
        }
        parloIntegrator = new NLUParloIntegrator(modelGr);
        lastPublishedOrTrained = null;

        result = parloIntegrator.getModelStatus();
        if (result && result.status === 'success') {
            if (result.lastPublishedOn) {
                lastPublishedOrTrained = new GlideDateTime(result.lastPublishedOn);
                gs.info('NLU Model: ' + modelId + ' - Updating published on: ' + lastPublishedOrTrained.getDisplayValueInternal());
                gr.setValue('last_published_on', lastPublishedOrTrained);
            }

            if (result.lastTrainedOn) {
                var lastTrainedOn = new GlideDateTime(result.lastTrainedOn);
                lastPublishedOrTrained = NLUHelper.getLatestDate(lastPublishedOrTrained, lastTrainedOn);
                gs.info('NLU Model: ' + modelId + ' - Updating trained on: ' + lastTrainedOn.getDisplayValueInternal());
                gr.setValue('last_trained_on', lastTrainedOn);
            }
        }

        modelUpdatedOn = NLUModel.getLastUpdatedOn(modelId);
        gs.info('NLU Model: ' + modelId + ' - Updated on: ' + modelUpdatedOn.getDisplayValueInternal());
        var dirty = !lastPublishedOrTrained || (modelUpdatedOn.getNumericValue() > lastPublishedOrTrained.getNumericValue());
        gs.info('NLU Model: ' + modelId + ' - Updating dirty: ' + dirty);
        gr.setValue('dirty', dirty);
        gr.setValue('model_updated_on', modelUpdatedOn);
        gr.update();
    }
})();
