(function executeRule(current, previous /*null when async*/ ) {

    var tables = NLUConstants.tables;

    // Create only model entities:
    if (!current.model.nil()) {
        var srcModelId = new NLUEntity(current.sys_id).getModelId();
        if (srcModelId && !NLUModel.isInCloning(srcModelId)) {
            var tgtModelGr = new NLUModel(srcModelId).getTranslatedModels();
            while (tgtModelGr.next()) {
                var newProps = {
                    model: tgtModelGr.getUniqueValue()
                };
                NLUImportUtil.createRecord(tables.SYS_NLU_ENTITY, current, newProps, true);
            }
        }
    }

})(current, previous);
