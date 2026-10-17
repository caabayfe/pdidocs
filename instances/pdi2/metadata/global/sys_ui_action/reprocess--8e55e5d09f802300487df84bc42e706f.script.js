var igr = new GlideRecord("sys_import_set");
igr.addQuery("concurrent_import_set",current.sys_id);
igr.query();
while(igr.next()){
	igr.state = "loaded";
	igr.update();
	var importSetJob = new GlideRecord("sys_concurrent_import_set_job");
	importSetJob.setValue("scheduled_import", current.scheduled_import);
	importSetJob.setValue("import_set", igr.sys_id);
	importSetJob.setValue("state", "pending");
	importSetJob.setValue("concurrent_import_set", current.sys_id);
	importSetJob.setValue("type", "reprocessing");
	importSetJob.insert();
}
action.setRedirectURL(current);
