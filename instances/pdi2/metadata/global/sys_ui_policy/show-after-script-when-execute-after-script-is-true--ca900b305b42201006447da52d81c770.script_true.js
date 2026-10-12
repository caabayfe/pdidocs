function onCondition() {

    var script = g_form.getValue('after_script');

    // Set default value for after script if empty
    if (script == '') {
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'cmdb_inst_application_feed');
        gr.addQuery('element', 'after_script');
        gr.query();
        if (gr.next())
            g_form.setValue('after_script', gr.getValue('default_value'));
    }
}
