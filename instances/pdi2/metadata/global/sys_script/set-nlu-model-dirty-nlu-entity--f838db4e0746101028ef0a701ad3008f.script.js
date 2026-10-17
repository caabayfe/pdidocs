var tables = NLUConstants.tables;

(function executeRule(current, previous /*null when async*/ ) {

    var modelId;
    if (current.model) {
        // Model entity - useful only in case of import. Normal creation will anyways trigger BR of M2M_SYS_NLU_UTTERANCE_ENTITY
        modelId = current.model;
    } else {
        var gr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
        gr.addJoinQuery(tables.SYS_NLU_INTENT, 'intent', 'intent');
        gr.addQuery('entity', current.getUniqueValue());
        gr.setLimit(1);
        gr.query();
        // As it's not model entity, all the intents will be under one model. 
        if (gr.next()) modelId = gr.intent.model;
    }

    if (modelId) {
        (new NLUModel(modelId)).setDirty();
    }

})(current, previous);
