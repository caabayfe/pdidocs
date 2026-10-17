(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecordSecure('sys_cb_topic_language');
	gr.addQuery('cb_topic_id', current.cb_topic_id);
	gr.addQuery('language_code', current.language_code);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	gr.deleteMultiple();

})(current, previous);
