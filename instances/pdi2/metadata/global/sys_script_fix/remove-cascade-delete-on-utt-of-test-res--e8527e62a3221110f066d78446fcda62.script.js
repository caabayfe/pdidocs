var dictGr = new GlideRecord('sys_dictionary');
dictGr.addQuery('name', 'nlu_batch_test_result');
dictGr.addQuery('element', 'utterance');
dictGr.addNotNullQuery('reference_cascade_rule');
dictGr.setLimit(1);
dictGr.query();
if (dictGr.next()) {
    dictGr.setValue('reference_cascade_rule', '');
    dictGr.update();
}
