var table = 'cmn_rota';

var dictionaryRecord = new GlideRecord('sys_dictionary');
dictionaryRecord.addQuery('name', table);
dictionaryRecord.addQuery('internal_type', "collection");
dictionaryRecord.addQuery("text_index", false);
dictionaryRecord.query();
if (dictionaryRecord.next()) {
    dictionaryRecord.text_index = true;
    dictionaryRecord.setWorkflow(false); //turn off workflow so cache is not flushed each time
    dictionaryRecord.update();
    GlideTextIndexEvent().indexAll(table, '');
}
