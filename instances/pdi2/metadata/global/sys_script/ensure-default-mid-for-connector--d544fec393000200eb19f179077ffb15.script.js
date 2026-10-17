function onBefore(current, previous) {
   	var gr = new GlideRecord('ecc_agent');
	gr.query();
	// If we only have one MID server defined, set it as the default!
	if (gr.getRowCount() == 1) {
		gr.next();
		gs.setProperty('mid.server.connector_default', gr.getValue("name"));
	}
}
   
