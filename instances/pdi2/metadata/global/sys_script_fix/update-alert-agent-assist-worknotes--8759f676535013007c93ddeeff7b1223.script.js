gs.log("Running fix script 'Update Alert Agent Assist (worknotes)'");
var gr = new GlideRecord("sys_properties");
gr.addQuery("name", "glide.knowman.attach.fields");
gr.query();
if (gr.next()) {
	var value = gr.getValue("value");
	if (GlideStringUtil.nil(value)) {
		gs.log("Value of glide.knowman.attach.fields property is empty. Updating the value to work_notes");
		gr.setValue("value", "work_notes");
	} else {
		gr.setValue("value", value + ",work_notes");
	}
	gr.update();
} else {
	gs.log("No such property: glide.knowman.attach.fields. Creating new property with value work_notes");
	gr.initialize();
	gr.setValue("name", "glide.knowman.attach.fields");
	gr.setValue("value", "work_notes");
	gr.insert();
}
