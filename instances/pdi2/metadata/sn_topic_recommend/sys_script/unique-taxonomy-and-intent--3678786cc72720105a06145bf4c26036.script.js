(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecordSecure('sn_topic_recommend_topic_linking');
	gr.addQuery('taxonomy', current.taxonomy);
	gr.addQuery('intent', current.intent);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('A topic for the same taxonomy and intent already exists'));
		current.setAbortAction(true);
	}
	
})(current, previous);
