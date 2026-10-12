(function executeRule(current, previous /*null when async*/) {
	if(!current.short_description)
		return;
	var gr = new GlideRecord('sn_access_analyzer_request');
    gr.addQuery('short_description', current.short_description);
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('Duplicate short description. Enter a valid short description'));
        current.setAbortAction(true);
    }
})(current, previous);
