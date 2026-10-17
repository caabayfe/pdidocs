(function() {
    var tables = NLUConstants.tables;
    var sysProps = NLUConstants.SYS_PROPS;
    var primaryField = NLUImportUtil.FIELDS_DATA[tables.SYS_NLU_MODEL].primaryField;

    var allSameLanguage = true;
    var foundUngroupedModel = false;

    var modelLang = null;
    var modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
    modelGr.query();
    while (modelGr.next()) {
        var language = NLUModel.getLanguage(modelGr);
        if (!modelLang) modelLang = language;
        if (modelLang !== language) allSameLanguage = false;

        if (!modelGr.getValue(primaryField)) {
            var otherModelGr = new GlideRecord(tables.SYS_NLU_MODEL);
            if (!otherModelGr.get(primaryField, modelGr.getUniqueValue())) {
                gs.info('Found an ungrouped model: ' + modelGr.getUniqueValue());
                foundUngroupedModel = true;
                break;
            }
        }
    }

    if (!allSameLanguage && foundUngroupedModel) {
        gs.info('NLU Model migration is complete!');
        gs.setProperty(sysProps.MIGRATION_COMPLETED, 'true');
    }

})();
