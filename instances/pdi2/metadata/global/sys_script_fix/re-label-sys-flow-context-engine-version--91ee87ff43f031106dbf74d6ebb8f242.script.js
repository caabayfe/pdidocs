
    var doc = new GlideRecord('sys_documentation');
    doc.addQuery('name', 'sys_flow_context');
    doc.addQuery('element', 'engine_version');
    doc.query();

    var dic = new GlideRecord('sys_dictionary');
    dic.addQuery('name', 'sys_flow_context');
    dic.addQuery('element', 'engine_version');
    dic.query();

    if (doc.next() && dic.next()){
        var docLabel = doc.getValue('label');
        var dicLabel = dic.getValue('column_label');

        if (!docLabel.equals('Last Executed Release') || !dicLabel.equals('Last Executed Release')) {
           doc.setValue('label', 'Last Executed Release');
           doc.setValue('plural', 'Last Executed Releases');
           doc.setWorkflow(false);
           doc.update();

           dic.setValue('column_label', 'Last Executed Release');
           dic.setWorkflow(false);
           dic.update();
	}
}
