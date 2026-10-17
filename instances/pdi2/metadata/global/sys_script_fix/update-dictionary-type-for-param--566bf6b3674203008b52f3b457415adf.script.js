updateColumnType("name");
updateColumnType("value");
function updateColumnType(columnName) {
	var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "pwd_verification_param");
    gr.addQuery("internal_type", "translated_text");
    gr.addQuery("element", columnName);
    gr.setWorkflow(false);
    gr.query();

    if(gr.next()) {
        gr.setValue("internal_type", "string");
        gr.update();
    }
}
