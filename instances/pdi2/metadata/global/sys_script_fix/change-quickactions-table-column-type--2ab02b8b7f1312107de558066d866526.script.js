updateColumnType(["name","description"]);

function updateColumnType(elements) {
    gs.info("Running fix script 'Change quickactions table column type for' column: " + JSON.stringify(elements));
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "quickactions_action");
    gr.addQuery("internal_type", "string");
    gr.addQuery("element",elements);
    gr.setWorkflow(false);
    gr.query();
    while (gr.next()) {
    	if(gr.element == "description")
    		gr.setValue("internal_type", "translated_text");
    	else
        	gr.setValue("internal_type", "translated_field");
        gr.update();
    }
}
