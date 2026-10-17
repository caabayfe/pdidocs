(function executeRule(current, previous /*null when async*/) {
	var msg;
	var gr = new GlideRecord("help_content");
		gr.addQuery("guidance_step", current.guidance_step);
		gr.addQuery("default_content", "1");
		gr.query();
		
		if(gr.getRowCount() == 1) {
			msg = gs.getMessage("Cannot change default content to false, please create or update a different content record and set it as default");
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
		}
	
})(current, previous);
