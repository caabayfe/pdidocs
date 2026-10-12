var gr = new GlideRecord("sys_dictionary");
if (gr.isValid()) {
    gr.addQuery("name", "sys_playbook_experience_record_generator");
    gr.addQuery("element", "create_record_form_view");
    gr.query();
    if (gr.next()) {
        gr.setValue("mandatory", false);
        gr.update();
    }
}
