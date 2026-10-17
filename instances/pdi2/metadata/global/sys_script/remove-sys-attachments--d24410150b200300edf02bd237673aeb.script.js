(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_attachment");
	gr.addQuery("table_sys_id", current.sys_id);
	gr.addQuery("file_name", current.start_at);
	gr.query();
	if(gr.next())
		gr.deleteRecord();
	

})(current, previous);
