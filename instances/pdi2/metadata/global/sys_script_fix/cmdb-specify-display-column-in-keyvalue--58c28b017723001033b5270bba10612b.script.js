var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'cmdb_key_value');
gr.addQuery('element', 'key');
gr.query();
if (gr.next()) {
    gr.setValue("display", true);
    gr.update();
}
