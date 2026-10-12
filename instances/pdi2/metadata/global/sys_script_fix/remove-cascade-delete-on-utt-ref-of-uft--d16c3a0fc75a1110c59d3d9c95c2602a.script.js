var dictGr = new GlideRecord('sys_dictionary');
dictGr.addQuery('name', 'ml_label_user_feedback');
dictGr.addQuery('element', 'utterance_reference');
dictGr.addNotNullQuery('reference_cascade_rule');
dictGr.setLimit(1);
dictGr.query();

if (dictGr.next()) {
    dictGr.setValue('reference_cascade_rule', '');
    dictGr.update();
}
