
    
    //This job marks the state for the existing retired VMware VMs state as terminated
    gs.info("Scheduled Job Started : Mark VM state as terminated");
    var batch_size = 10000;
    var job_count = 10;
    var total_records = batch_size * job_count;

    var vmGR = new GlideRecord("cmdb_ci_vmware_instance");
    vmGR.addQuery("state", "");
    vmGR.addQuery("install_status", 7);
    vmGR.setLimit(total_records);
    vmGR.query();
if (!vmGR.hasNext()) {
	var jobGr = new GlideRecord("sysauto_script");
	jobGr.addQuery("sys_id", "53a48dfc97987d50a24c75b71153af06"); // Sys id of this Scheduled job
	jobGr.query();
	if (jobGr.next()) {
		jobGr.setValue("active", false); // If no old model compute template records are not present, deactivate this schedule job
		jobGr.update();
		gs.info("Scheduled Job Mark VM state as terminated is marked inactive");
	}
} else {
    for (var count = 0; count < job_count; count++) {
        var vmSysIds = [];
        for (var i = 0; i < batch_size && vmGR.next(); i++) {
            vmSysIds.push('' + vmGR.sys_id);
        }
        if (vmSysIds) {
            var job = new GlideRunScriptJob();
            job.scheduleScript("var vmGR = new GlideRecord('cmdb_ci_vmware_instance');\n" +
								   "vmGR.addQuery('sys_id', 'IN', '"+   vmSysIds +"');\n" +
								   "vmGR.setValue('state', 'terminated');\n" +
								   "vmGR.updateMultiple();\n", "Mark VM state as terminated", new GlideDateTime());
        }
    }
}
gs.info("Scheduled Job Ended : Mark VM state as terminated");
