(function executeRule(current, previous) {
	var gr = new GlideRecord('sn_topic_recommend_default_setting');
	gr.addQuery('data_source', current.data_source);
	gr.addQuery('taxonomy', current.taxonomy);
	gr.query();
	if (gr.next() && gr.sys_id != current.sys_id) {
		gs.addErrorMessage(gs.getMessage('There\'s already a default setting for this data source and taxonomy. To update it, go to the record for it.'));
		current.setAbortAction(true);
	}

})(current, previous);
