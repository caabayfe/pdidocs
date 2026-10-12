var gr = GlideRecord("sys_generative_ai_request_validator");
gr.query();
while (gr.next()) {
    var documentId = gr.getValue('document_id');
    var documentTable = gr.getValue('document_table');
    if (!documentId && !documentTable) {
        gr.setValue("document_id", gr.getValue("definition"));
        gr.setValue("document_table", "sys_one_extend_capability_definition");
        gr.update();
    }
}
