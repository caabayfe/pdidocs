//Need to unload the sys_ui_form_sections file for the sys_ui_form because
//the sys_ui_form_sections have cascade delete on sys_ui_element.  Since
//sys_ui_form_section is not update_synch (and shouldn't be) we need to
//make sure sys_ui_form_sections file is correct.  This case baselines the version
//before the delete so system version isn't lost

//get the form
var formGR = new GlideRecord("sys_ui_form");
formGR.addQuery("name", current.name);
formGR.addQuery("view", current.view);
formGR.query();
if (formGR.next()) {
	 var formSysID = formGR.getValue("sys_id");
	 var sf = new GlideSysForm(current.name, current.view);
	 sf.createDefaultBaselineVersion(formGR);
}

//Create a baseline for the section also
var sForm = new GlideSysForm(current.name, current.view);
sForm.createDefaultBaselineVersion(previous);
