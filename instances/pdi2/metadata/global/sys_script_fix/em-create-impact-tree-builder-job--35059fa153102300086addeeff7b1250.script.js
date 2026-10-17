var jobName = "Event Management - Impact Tree Builder";

var gr = new GlideRecord("sys_trigger");
gr.addQuery("name", jobName);
gr.query();
if (gr.hasNext()) {
	gs.info(jobName + " job already exists. No need to create another job. Exiting...");

} else {
	
	gr = new GlideRecord("sys_trigger");
	gr.setValue("name", jobName);
	gr.setValue("system_id", "ACTIVE NODES");
	gr.setValue("priority", 100);
	gr.setValue("trigger_type", 1); //repeat
	gr.setValue("state", 0); //ready
	
	var duration = new GlideDuration(11 * 1000);
	gr.setValue("repeat", duration);
	
	var script = "var impactManager = new SNC.ImpactManager(); impactManager.handleForTriggeredServices();";
	gr.setValue("script", script);
	
	gs.log('1. Setting workflow to true before creating job of ' + jobName);
	var wf = session.setWorkflow(true); //enable business rule (disabled by default on fix scripts)
	gs.log('2. Old workflow was ' + wf +' before creating job of ' + jobName + ', current workflow is '+ session.getWorkflow());
		
	var jobId = gr.insert();
	gs.info(jobName + " job was created with sys ID " + jobId);
	
	session.setWorkflow(wf);
	gs.log('3. Setting workflow back to ' + wf +' before creating job of ' + jobName + ', current workflow after set is ' + session.getWorkflow());

}
