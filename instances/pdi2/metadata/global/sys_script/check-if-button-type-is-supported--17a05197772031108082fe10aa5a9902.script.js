(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_sg_button");
    gr.addQuery("sys_id", "=", current.getValue("source_id"));
    gr.query();

    if (gr.next()) {
		var type = gr.type;
		if ('write_back' != type && 'redirection' != type) {
			gs.addErrorMessage(gs.getMessage("Only writeback or navigation button type is supported."));
			current.setAbortAction(true);
		} 
    }

})(current, previous);
