(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_nlu_entity");
	gr.addQuery("primary_entity", current.sys_id);
	gr.setValue("name", current.name);
	gr.updateMultiple();	

})(current, previous);
