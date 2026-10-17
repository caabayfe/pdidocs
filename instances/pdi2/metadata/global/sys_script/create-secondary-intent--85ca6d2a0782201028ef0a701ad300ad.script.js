(function executeRule(current, previous /*null when async*/ ) {
    var tables = NLUConstants.tables;

    var srcModelId = current.model;
    if (srcModelId && !NLUModel.isInCloning(srcModelId)) {
        var tgtModelGr = new NLUModel(srcModelId).getTranslatedModels();
        while (tgtModelGr.next()) {
            var newProps = {
                model: tgtModelGr.getUniqueValue(),
                enable: false
            };
            NLUImportUtil.createRecord(tables.SYS_NLU_INTENT, current, newProps, true);
        }
    }

})(current, previous);
