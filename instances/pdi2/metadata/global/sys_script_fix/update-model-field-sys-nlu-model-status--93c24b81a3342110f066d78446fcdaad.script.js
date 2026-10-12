var dictGr = new GlideRecord('sys_dictionary');
dictGr.addQuery('name', 'sys_nlu_model_status');
dictGr.addQuery('element', 'model');
dictGr.query();
if (dictGr.next()) {
    dictGr.setValue('display', 'true');
    dictGr.update();
}
