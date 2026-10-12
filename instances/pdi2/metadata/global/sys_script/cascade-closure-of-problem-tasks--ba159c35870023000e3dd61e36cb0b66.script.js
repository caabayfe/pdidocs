var bypassCanCreatePTaskCheck; // Adding this var to pass a flag to subsequent BR to relax its check if current BR is originator. 
(function executeRule(current, previous /*null when async*/ ) {

    // Applies only on Ptask movement to a) Open (Non-closed) state target problem b) Closed state problem. The below if kicks in only in  
    // cases of duplicate marking. - DEF0190002 
    if (!current.duplicate_of.nil() && current.resolution_code + '' === 'duplicate') {
        // check if Ptask movement is indeed specified on Problem properties else ignore 
		var problemUtil = new ProblemV2Util();
		var recordsToMove = gs.getProperty("problem.duplicate.records_to_move");
		var recordsMap = problemUtil.dotCommaToMap(recordsToMove.split(","));
       if (recordsMap.hasOwnProperty('problem_task') && recordsMap['problem_task'] + '' === 'problem') {
            bypassCanCreatePTaskCheck = true;
            var originalProblemGr = current.duplicate_of.getRefRecord();
            // Only close if Target problem is closed and property for cancelling is enabled.
            if (originalProblemGr.state + '' === ProblemState.STATES.CLOSED &&
                gs.getProperty("problem.closed.cancel_open_tasks") == "true") {
                gs.debug("Initiating moveAndCloseRecords from BR 'Cascade closure of Problem Tasks' bypassCanCreatePTaskCheck set to True");
                problemUtil.moveAndCloseRecords('problem_task', 'problem', current, originalProblemGr);
            } else {
                problemUtil.moveRecords('problem_task', 'problem', current, originalProblemGr);
            }
        } else {
			// OOTB we are shipping this as enabled
            gs.debug("Skipping movement of PTasks as Problem properties does not have Ptask movement enabled");
        }
    }

    // Retained as-is for Cases of simple closure and not duplicate marking. 
    if (gs.getProperty("problem.closed.cancel_open_tasks") == "true") {
        var PRB_TASK_CLOSED_STATE = ProblemTaskState.States.CLOSED;
        var problemTaskGr = new GlideRecord("problem_task");
        problemTaskGr.addQuery("problem", current.getUniqueValue());
        problemTaskGr.addActiveQuery();
        problemTaskGr.setValue("state", PRB_TASK_CLOSED_STATE);
        problemTaskGr.setValue("close_code", "canceled");
        problemTaskGr.setValue("close_notes", gs.getMessage("Problem Task is Canceled based on closure of {0}.", current.getDisplayValue()));
        problemTaskGr.updateMultiple();
    }
})(current, previous);
