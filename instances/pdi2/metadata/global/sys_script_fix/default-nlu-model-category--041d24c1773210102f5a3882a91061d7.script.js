function updateNLUModelCategory(category) {
    var gr = new GlideRecord("sys_nlu_model");
    gr.addNullQuery("category");
    gr.query();
    while (gr.next()) {
        gr.setValue("category",category);
        gr.setWorkflow(false);
		gr.autoSysFields(false);
        gr.update();
    }
}

updateNLUModelCategory("virtual_agent");
