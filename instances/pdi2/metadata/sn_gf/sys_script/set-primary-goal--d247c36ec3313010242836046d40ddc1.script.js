(function executeRule(current, previous /*null when async*/ ) {

    var oldPrimaryGoalRelationship = sn_gf.WorkItemGoalRelationshipHelper.getOtherPrimaryGoalRelationshipOnWorkItem(current.goal, current.target, current.entity_id);
    if (oldPrimaryGoalRelationship != null) {
        oldPrimaryGoalRelationship.setValue("is_primary_goal", false);
        oldPrimaryGoalRelationship.update();
    }
    var isWorkItemPrimaryGoalUpdatedByUser = (current.getValue('goal') == current.getElement('entity_id.primary_goal').toString() && current.getValue('target') == current.getElement('entity_id.primary_target').toString()) ||
        (!gs.nil(current.getValue('planning_item_id')) && current.getValue('goal') == current.getElement('planning_item_id.primary_goal').toString() && current.getValue('target') == current.getElement('planning_item_id.primary_target').toString());

    sn_gf.WorkItemGoalRelationshipHelper.updatePrimaryGoalOnWorkItem(current.getValue('goal'), current.getValue('target'), current.getValue('table_name'), current.getValue('entity_id'));

})(current, previous);
