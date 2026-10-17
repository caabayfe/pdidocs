(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("cmdb_multisource_data");
	gr.addQuery("ci", current.sys_id);
	gr.deleteMultiple();

})(current, previous);
