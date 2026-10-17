function onLoad() {
   //Restrict Layout change if there is a related content 
	var msg = top.snhelp && top.snhelp.addContentMsg || getMessage("There is no content added for this step. Please add content in the table below");
	if(!g_form.isNewRecord()) {
		var gr = new GlideRecord('help_content');
			gr.addQuery("guidance_step", g_form.getUniqueValue());
			gr.query();
			if(gr.hasNext()) {
				g_form.setReadOnly("layout", true);
			} else {
				g_form.addInfoMessage(msg);
			}
	}
	// reset top.message
	if(top.snhelp && top.snhelp.addContentMsg)
		top.snhelp.addContentMsg = "";
	
}
