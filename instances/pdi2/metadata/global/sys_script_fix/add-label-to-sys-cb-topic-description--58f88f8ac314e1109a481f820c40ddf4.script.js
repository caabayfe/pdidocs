var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_cb_topic');
gr.addQuery('element', 'description');
gr.query();
while (gr.next()) {
    gr.setValue('column_label', 'Description');
    if (gr.update()) {
        gs.log("Updated the label of sys_cb_topic.description");
    } else {
        gs.logError("Failed to update the label of sys_cb_topic.description");
    }
}
