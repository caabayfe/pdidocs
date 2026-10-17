(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_cs_nlu_language');
	gr.newRecord();
	gr.language = current.sys_id;
	gr.insert();
})(current, previous);
