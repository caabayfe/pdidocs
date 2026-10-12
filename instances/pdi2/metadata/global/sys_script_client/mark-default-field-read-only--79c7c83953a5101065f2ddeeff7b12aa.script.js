function onLoad() {
   	var isFirst = false;
	var isNew = false;
	var gr = new GlideRecord('help_content');
	gr.addQuery('guidance_step', g_form.getValue("guidance_step"));
	gr.query();
	isFirst = !gr.hasNext();
	
	isNew = g_form.isNewRecord(); 
	
	if((isNew && isFirst) || (!isNew && g_form.getValue("default_content") == "true")) {
		g_form.setReadOnly("default_content", true);
	}
}
