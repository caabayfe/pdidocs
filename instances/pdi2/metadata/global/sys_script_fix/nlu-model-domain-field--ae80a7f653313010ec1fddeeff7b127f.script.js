(function() {
    if (pm.isZboot()) {
        return;
    }
    var tables = NLUConstants.tables;
    var glideRecord = new GlideRecord(tables.SYS_DICTIONARY);
    glideRecord.addQuery('name', tables.SYS_NLU_MODEL);
    glideRecord.addQuery('element', 'model_domain');
    glideRecord.query();
    if (glideRecord.next()) {
        glideRecord.setValue('read_only', 'false');
        glideRecord.setValue('internal_type', 'glide_list');
        glideRecord.update();
        gs.info('NLU Model: Upgraded model_domain column to glide_list');
    }

})();
