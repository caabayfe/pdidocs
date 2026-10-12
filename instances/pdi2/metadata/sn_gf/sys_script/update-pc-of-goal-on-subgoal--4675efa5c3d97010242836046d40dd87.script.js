(function executeRule(current, previous /*null when async*/ ) {
    if (current.parent_goal.changes() && previous.parent_goal) {
        new sn_gf.GoalsRollUpHelper(previous.parent_goal.getRefRecord(), previous, current).rollUpPercentCompleteWhenParentChanges();
    }
    if (current.parent_goal) {
        new sn_gf.GoalsRollUpHelper(current.parent_goal.getRefRecord(), previous, current).rollUpPercentComplete();
    }
})(current, previous);
