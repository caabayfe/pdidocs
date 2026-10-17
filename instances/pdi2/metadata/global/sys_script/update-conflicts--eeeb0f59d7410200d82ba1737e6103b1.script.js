(function executeRule(current, previous /*undefined when async or display*/) {

	new ChangeConflictExecution(current, gs).scheduleConflictDetection();

})(current, typeof previous != 'undefined' ?  previous : null);
