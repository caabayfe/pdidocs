(function executeRule(current, previous /*null when async*/ ) {
    var tables = NLUConstants.tables;
    var ga = new GlideAggregate(tables.M2M_SYS_NLU_UTTERANCE_ENTITY);
    ga.addQuery('entity', current.getValue('entity'));
    ga.addQuery('utterance.intent', current.utterance.intent.getValue());
    ga.addAggregate('COUNT');
    ga.query();

    var annotationCount = ga.next() && parseInt(ga.getAggregate('COUNT'), 10) || 0;
    if (annotationCount === 0) {
        var ga1 = new GlideAggregate(tables.M2M_SYS_NLU_INTENT_ENTITY);
        ga1.addQuery('entity', current.getValue('entity'));
        ga1.addAggregate('COUNT');
        ga1.query();
        var intentEntityCount = ga1.next() && parseInt(ga1.getAggregate('COUNT'), 10) || 0;
        if (intentEntityCount > 1) {
            var gr = new GlideRecord(tables.M2M_SYS_NLU_INTENT_ENTITY);
            gr.addQuery('entity', current.getValue('entity'));
            gr.addQuery('intent', current.utterance.intent.getValue());
            gr.query();
            if (gr.next())
                gr.deleteRecord();
        }
    }

})(current, previous);
