gs.info("Playbook Auto Archive Scheduler running...");

var retentionPolicyDays = gs.getProperty("sn_pa_designer.data_retention_policy");

var startTime = new GlideDateTime().getNumericValue();
var currentTime = startTime;

var exitEarly = false;
var timeLimitMinutes = 20;

var timeLimitMilliseconds = timeLimitMinutes * 60000; // DO NOT CHANGE THIS VALUE; ADJUST TIME USING timeLimitMinutes
var batchesCompleted = 0;

// Archive in batches for the allotted time and then take a break
// unless there are no records to archive, in which case exit early.
while ((currentTime - startTime < timeLimitMilliseconds) && !exitEarly) {
	// Eligible records are non-error terminal states that were last updated past the retention policy number of days
	var gr = new GlideRecord("sys_pd_context");
	gr.addQuery("state", "COMPLETE").addOrCondition("state", "CANCELLED").addOrCondition("state", "SKIPPED");
	gr.addQuery("sys_updated_onRELATIVELT@dayofweek@ago@14");
	gr.addNullQuery("parent_activity_context");
	gr.orderBy("sys_created_on");
	gr.setLimit(1000);
	gr.query();

	var contextIdsToArchive = [];
	while(gr.next()) {
		if (gr.process_definition.getRefRecord().isValidRecord()) {
			contextIdsToArchive.push(gr.getUniqueValue());
		}
	}

	if (contextIdsToArchive.length > 0) {
		var processService = new global.PDProcessService();
		var result = processService.archiveProcessContexts(contextIdsToArchive);
		batchesCompleted++;

		// If nothing in the batch was actually archived or deleted, the next query
		// would return the same stuck set — exit instead of spinning for 20 minutes.
		if (result && result.archived === 0 && result.deleted === 0) {
			gs.info("Batch produced no archive or delete; ending run early.");
			exitEarly = true;
		}
	}
	else {
		if (batchesCompleted === 0) gs.info("No eligible playbook contexts to archive.");

		// No need to keep polling if there's no eligible records
		exitEarly = true;
	}

	currentTime = new GlideDateTime().getNumericValue();
}

gs.info("Playbook Auto Archive Scheduler completed " + batchesCompleted + " batches.");
