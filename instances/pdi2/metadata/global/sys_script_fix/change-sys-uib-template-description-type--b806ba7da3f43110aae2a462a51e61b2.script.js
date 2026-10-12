updateUIBTemplateDescriptionType();
function updateUIBTemplateDescriptionType () {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sys_uib_template");
	gr.addQuery("element", 'description');
	gr.query();
	if (gr.next()) {
		gr.setValue("internal_type", "translated_text");
		gr.update();
	}
};
