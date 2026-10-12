(function executeRule(current, previous /*null when async*/ ) {

    var tables = NLUConstants.tables;

    var srcModelId = current.intent.model;
    if (srcModelId && !NLUModel.isInCloning(srcModelId)) {
        var srcIntentId = current.getValue('intent');
        var srcEntityId = current.getValue('entity');

        var tgtModelGr = new NLUModel(srcModelId).getTranslatedModels();
        while (tgtModelGr.next()) {
            var tgtModelId = tgtModelGr.getUniqueValue();
            var tgtIntentGr = NLUTranslateUtil.getTranslatedRecord(tables.SYS_NLU_INTENT, tgtModelId, srcIntentId);
            if (!tgtIntentGr) continue;

            var tgtEntityId = null;
            var tgtEntityGr = NLUTranslateUtil.getTranslatedRecord(tables.SYS_NLU_ENTITY, tgtModelId, srcEntityId);
            if (!tgtEntityGr) {
                var srcEntityGr = new GlideRecord(tables.SYS_NLU_ENTITY);
                if (srcEntityGr.get(srcEntityId))
                    tgtEntityId = NLUImportUtil.createRecord(tables.SYS_NLU_ENTITY, srcEntityGr, null, true);
            } else {
                tgtEntityId = tgtEntityGr.getUniqueValue();
            }
            if (tgtEntityId)
                new NLUIntent(tgtIntentGr.getUniqueValue()).createIntentEntityMap(tgtEntityId, current.relationship);
        }
    }

})(current, previous);
