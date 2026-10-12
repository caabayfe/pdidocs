(function executeRule(current, previous /*null when async*/ ) {

    if (!sn_gf.WorkItemGoalRelationshipHelper.getOtherPrimaryGoalRelationshipOnWorkItem(current.getValue('goal'), current.getValue('target'), current.getValue('entity_id'))) {
        current.setValue("is_primary_goal", true);
    }

})(current, previous);
