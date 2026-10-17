(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sn_topic_recommend_view_status');
	if (gr.isValid()) {
		gr.setValue('report_type', 'analysis');
		gr.setValue('report_id', current.sys_id);
		gr.insert();
	}

})(current, previous);
