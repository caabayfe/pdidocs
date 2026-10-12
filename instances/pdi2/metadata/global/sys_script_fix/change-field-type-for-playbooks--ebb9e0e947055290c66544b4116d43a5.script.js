if (!pm.isZboot()) {
    var dictionaryGr = new GlideRecord('sys_dictionary');
    var tableQuery = dictionaryGr.addQuery('name', 'sys_pd_process_definition');
    tableQuery.addOrCondition('name', 'sys_pd_derivative');
    tableQuery.addOrCondition('name', 'sys_pd_activity');
    tableQuery.addOrCondition('name', 'sys_pd_lane');
    var elementQuery = dictionaryGr.addQuery('element', 'description');
    elementQuery.addOrCondition('element', 'label');
    dictionaryGr.query();
    while (dictionaryGr.next()) {
        dictionaryGr.setValue('internal_type', 'String');
        dictionaryGr.setWorkflow(false);
        dictionaryGr.update();
    }
}
