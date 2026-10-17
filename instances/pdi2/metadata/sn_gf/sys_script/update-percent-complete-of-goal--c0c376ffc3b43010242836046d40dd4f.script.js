(function executeRule(current, previous /*null when async*/) {

	if (current.goal.changes() && previous.goal) {
        new sn_gf.GoalsRollUpHelper(previous.goal.getRefRecord(), previous, current).rollUpPercentCompleteWhenParentChanges();
    }
	if(current.goal) {
		new sn_gf.GoalsRollUpHelper(current.goal.getRefRecord(), previous, current).rollUpPercentComplete();		
	}

})(current, previous);
