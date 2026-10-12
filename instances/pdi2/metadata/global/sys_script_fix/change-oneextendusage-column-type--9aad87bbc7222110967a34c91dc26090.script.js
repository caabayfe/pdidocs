var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_one_extend_usage");
gr.addQuery("element", "definition");
gr.query();
if (gr.next()) {
	var internalType = gr.getValue("internal_type");
	if(internalType != "glide_list") {
        gr.setValue("internal_type", "glide_list");
        gr.setValue("column_label", "Definitions");
		gr.update();
	}
}
