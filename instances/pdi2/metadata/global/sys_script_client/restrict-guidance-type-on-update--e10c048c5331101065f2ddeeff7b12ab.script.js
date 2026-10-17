function onLoad() {
   //Restrict changing guidance type on update
	var type = g_form.getValue("type");
	var sncCreated = g_form.getValue("snc_created") || false;
	var guidanceFields = ["name","description","context","auto_launch_order","type","roles","status","sys_domain","sys_domain_path","app_route","order","route_params","eh_content","topic_id","version"];

	if(!g_form.isNewRecord() && (type === "embedded_help" || hasSteps()))
		g_form.setReadOnly("type", true);

	//Mark all the fields readonly except Active
	if(sncCreated && sncCreated !== "false") {
		guidanceFields.forEach(function(field) {
			g_form.setReadOnly(field, true);
		});
	}

	/*STRY52440153:  Removing Personal setup from the UI, it will remain in the DB*/
	g_form.removeOption('type', 'personal_setup');
    
}
function hasSteps() {
	var gr = new GlideRecord('help_guidance_step');
		gr.addQuery("guidance", g_form.getUniqueValue());
		gr.query();

		return gr.hasNext();

}
