(function executeRule(current, previous /*null when async*/ ) {

    var goalUtil = new sn_gf.GFGoal();
    //update previous values only entity type and values were present previously
    if (previous.getValue('assigned_entity_type') && previous.getValue('assigned_entity') && previous.getValue('assigned_entity_type') != current.getValue('assigned_entity_type')) {
        var previousAssignedEntityColumn = goalUtil.getAssignedEntityReferenceColumn(previous.getValue('assigned_entity_type'));
        if (previousAssignedEntityColumn)
            current.setValue(previousAssignedEntityColumn, '');
    }

    var currentAssignedEntityColumn = goalUtil.getAssignedEntityReferenceColumn(current.getValue('assigned_entity_type'));
    if (currentAssignedEntityColumn)
        current.setValue(currentAssignedEntityColumn, current.getValue('assigned_entity'));

})(current, previous);
