var gr = new GlideRecord("sa_hash");
gs.info("EM upgrade. Enable impact calculation after plugin activation.");
gr.addQuery("name", "impact_calculation_enable_prev_value");
gr.query();
if(gr.next()){
	gs.info("EM upgrade. The previous value of impact_calculation_enable is " + gr.hash + ". Skip updating.");
} else {
	var grUpdate = new GlideRecord("sa_hash");
	grUpdate.addQuery("name", "impact_calculation_enable");
	grUpdate.query();
	if(grUpdate.next()){
		grUpdate.hash = 'true';
		grUpdate.update(); 		
	}
}
