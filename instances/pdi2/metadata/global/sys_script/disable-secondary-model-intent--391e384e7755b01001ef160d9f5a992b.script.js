(function executeRule(current, previous /*null when async*/) {
	
	var gr = new GlideRecord("sys_nlu_intent");
	gr.addQuery("primary_intent", current.sys_id);
	gr.setValue("enable", false);
	gr.updateMultiple();

})(current, previous);
