function onCondition() {

    var script = g_form.getValue('before_script');

    // Set default value for before script if empty
    if (script == '') {
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'cmdb_inst_application_feed');
        gr.addQuery('element', 'before_script');
        gr.query();
        if (gr.next())
            g_form.setValue('before_script', gr.getValue('default_value'));
    }
}
