if(current.name && current.name.indexOf("Pending:") == 0) {
	current.setWorkflow(false);
	//Delete associated pending applications as well
	var gr = new GlideRecord("cmdb_ci_appl_pending");
	gr.addQuery("classifier", current.sys_id);
	gr.deleteMultiple();
} else {
	current.setWorkflow(true);
}

current.deleteRecord();
