addMandatoryForTableAndView();
function addMandatoryForTableAndView() {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sysrule_view_workspace");
	gr.addQuery("element=table^ORelement=view");
	gr.query();
	while (gr.next()) {
		gr.setValue("mandatory", true);
		gr.update();
	}
}
