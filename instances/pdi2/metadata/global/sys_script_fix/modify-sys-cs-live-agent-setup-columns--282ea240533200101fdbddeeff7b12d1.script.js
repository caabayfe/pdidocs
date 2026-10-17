updateColumnType("transfer_message");
updateColumnType("no_agent_available_message");

function updateColumnType(element) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_cs_live_agent_setup");
    gr.addQuery("internal_type", "string");
    gr.addQuery("element", element);
    gr.setWorkflow(false);
    gr.query();
    if(gr.next()) {
        gr.setValue("internal_type", "translated_text");
        gr.update();
    }
}
