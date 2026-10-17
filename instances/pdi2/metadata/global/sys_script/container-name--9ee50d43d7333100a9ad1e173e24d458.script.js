function onBefore(current, previous) {
	//This function will be automatically called when this rule is processed.
	var gr = new GlideRecord("sp_container");
	gr.addQuery("sp_page", current.sys_id);	  
	gr.query();
	while (gr.next()) {
		if (!current.title.nil())
			gr.name = current.title;
		else
			gr.name = current.id;
		gr.name += " - Container " + gr.order;
		gr.setWorkflow(false);
		gr.update();
		gs.updateSave(gr);
	}
}
