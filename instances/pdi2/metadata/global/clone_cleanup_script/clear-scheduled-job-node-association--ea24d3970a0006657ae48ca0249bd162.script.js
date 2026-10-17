var names = [];
names.push('Clean logs');
names.push('Clean Temp Files');	
names.push('events process');
names.push('System - reduce resources');

var jobIds = getDuplicateJobSysIds(names);
deleteJobs(jobIds);

function deleteJobs(sysIds) {
	gs.log("InstanceClone: deleting " + sysIds.length + " duplicate sys_trigger jobs"); 
	var md = new GlideMultipleDelete('sys_trigger');
	md.addQuery('sys_id', 'IN', sysIds);
	md.execute();
}

function getDuplicateJobSysIds(names) {
	var jobSysIds = [];
	var jobs = [];
	
	var gr = new GlideAggregate("sys_trigger");
	gr.setWorkflow(false);
	gr.addAggregate("COUNT", "sys_id");
	gr.addAggregate("MIN", "sys_id");
	gr.addQuery("name", "IN", names);
	gr.groupBy("name");
	gr.groupBy("job_id");
	gr.groupBy("trigger_type");
	gr.groupBy("repeat");
	gr.groupBy("system_id");
	gr.addHaving("COUNT", ">", "1");
	gr.query();

	while(gr.next()) {
		var count = gr.getAggregate("COUNT", "sys_id");
		var firstSysId = gr.getAggregate("MIN", "sys_id");	
		if (count <= 1)
			continue;
	
		var job = { 
			name: gr.getValue("name"), 
			job_id: gr.getValue("job_id"), 
			trigger_type: gr.getValue("trigger_type"),
			repeat: gr.getValue("repeat"),
			system_id: gr.getValue("system_id")||'',
			firstSysId: firstSysId
		};
		jobs.push(job);
	}
	gr.close();

	for (var i = 0; i < jobs.length; i++) {
		var job = jobs[i];
		var grd = new GlideRecord("sys_trigger");
		grd.addQuery("name", job.name);
		grd.addQuery("job_id", job.job_id);
		grd.addQuery("trigger_type", job.trigger_type);
		grd.addQuery("repeat", job.repeat);
		grd.addQuery("system_id", job.system_id);
		grd.query();
	
		while (grd.next()) {
			var sysId = grd.getValue("sys_id");
			if (sysId == job.firstSysId) {
				gs.log("InstanceClone: skipping FIRST sys_trigger duplicate job: " + job.name + " (sys_id=" + sysId + ")");
				continue;
			}
			
			gs.log("InstanceClone: marking sys_trigger duplicate job for deletion: " + job.name + " (sys_id=" + sysId + ")");
			jobSysIds.push(sysId);
		}
		grd.close();
	}
	
	return jobSysIds;
}
