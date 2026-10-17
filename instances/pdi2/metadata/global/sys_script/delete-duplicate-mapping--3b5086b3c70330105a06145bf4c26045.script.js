(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecordSecure('sys_cs_topic_language');
	gr.addQuery('cs_topic_id', current.cs_topic_id);
	gr.addQuery('language_code', current.language_code);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	gr.deleteMultiple();

})(current, previous);
