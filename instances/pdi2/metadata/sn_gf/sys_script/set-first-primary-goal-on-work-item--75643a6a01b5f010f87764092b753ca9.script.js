(function executeRule(current, previous /*null when async*/) {
	//allow creation of goalRel record if it's not a primary_goal
	//if there is no primary goal related, make it primary goal 
	if(!sn_gf.WorkItemGoalRelationshipHelper.getOtherPrimaryGoalRelationshipOnWorkItem(current.getValue('goal'), current.getValue('target'), current.getValue('entity_id'))) {
		//update work item's primary_goal
		sn_gf.WorkItemGoalRelationshipHelper.updatePrimaryGoalOnWorkItem(current.goal, current.target, current.table_name, current.entity_id);
	}
	
})(current, previous);
