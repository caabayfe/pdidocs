(function executeRule(current, previous /*null when async*/ ) {
    //check if already primary_goal record exists, then make the current as primary
    //update the old rel record to non primary

    var goalRelGr = sn_gf.WorkItemGoalRelationshipHelper.getOtherPrimaryGoalRelationshipOnWorkItem(current.goal, current.target, current.entity_id);
    if (goalRelGr != null) {
        goalRelGr.setValue('is_primary_goal', false);
        goalRelGr.update();
    }
    //update work item primary goal
    sn_gf.WorkItemGoalRelationshipHelper.updatePrimaryGoalOnWorkItem(current.goal, current.target, current.table_name, current.entity_id);

})(current, previous);
