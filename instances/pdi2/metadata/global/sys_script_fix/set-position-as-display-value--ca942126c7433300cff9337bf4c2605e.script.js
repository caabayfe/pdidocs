var gr = new GlideRecord('sys_dictionary');
gr.addQuery('element', 'position');
gr.addQuery('name', 'sys_ui_form_section');
gr.query();
if (gr.next()) {
	if (gr.getValue('display') == true)
		gs.info("Display value for sys_ui_form_section.position is already true");
	else {
		gr.setValue("display", true);
		gr.setWorkFlow(false);
		gr.setUseEngines(false);
		gr.update();
		gs.info("Set display value for sys_ui_form_section.position to true");
	}
}
