var templates = new GlideRecord("sn_templated_snip_note_template");
templates.addNullQuery("short_name");
templates.query();
while(templates.next()){
	templates.setWorkflow(false);
	templates.setValue("short_name", templates.getValue("name"));
	templates.update();
}
