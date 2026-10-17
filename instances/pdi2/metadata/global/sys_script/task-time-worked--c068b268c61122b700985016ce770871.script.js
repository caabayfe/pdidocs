/*
 * Create task_time_worked records from the task timer incremental value
 * Also see 'Update task timer' business rule which will update the task's total time in the case of modified/deleted time worked records
 * Service-now.com
 */
createTimeWorked();

function createTimeWorked() {
    //updated task, calc difference in timer
    if (current.operation() == 'update') {
        var end = current.time_worked.dateNumericValue();
        var start = previous.time_worked.dateNumericValue();
        var diff = end - start;
    }
    else {
        var diff = current.time_worked.dateNumericValue();
    }
    if (diff == 0) 
        return;
	
    var tw = new GlideRecord('task_time_worked');
    tw.user = gs.userID();
    tw.task = current.sys_id;
    tw.time_worked.setDateNumericValue(diff);
	if(tw.isValidField("rate_type") && (typeof TimeSheetPolicy != 'undefined')){
		var tsp = TimeSheetPolicy.getFromUserId(gs.userID());
		var isMultiRatetypeAllowed = tsp.allowMultipleRatetypes();
		if(isMultiRatetypeAllowed)
			tw.setValue("rate_type",tsp.defaultRateType());
	}
    if (current.comments.changes()) {
        tw.comments = current.comments.getJournalEntry(1);
    } 
    tw.insert();
}
