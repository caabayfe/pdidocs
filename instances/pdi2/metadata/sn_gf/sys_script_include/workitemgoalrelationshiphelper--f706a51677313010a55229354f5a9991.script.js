var WorkItemGoalRelationshipHelper = Class.create();

WorkItemGoalRelationshipHelper.insertOrUpdateWorkItemGoalRelationship = function(previous, current) {
    //previous & current are GlideRecord instances of Work Item
    var operation = current.operation();
    var previousPrimaryGoalId = previous.getValue('primary_goal');
    var currentPrimaryGoalId = current.getValue('primary_goal');
    var currentPrimaryTargetId = (GlidePluginManager.isActive('sn_gfa') && current.isValidField('primary_target')) ? current.getValue('primary_target') : '';
    var tableName = sn_gf.GFGoalRelationshipSNC.getWorkItemTableName(current);
    var workItemId = current.getUniqueValue();
    if (operation == "insert") { //WorkItem is inserted
        var planningItemIdForWorkItem = GlidePluginManager.isActive("com.sn_align_cmn_int") ? sn_gf.GFIntegrationUtil.getPlanningItemIdForExecutionEntity(workItemId) : null;
        if (planningItemIdForWorkItem != null && sn_gf.GFGoalRelationshipSNC.checkGoalRelationshipRec(currentPrimaryGoalId, currentPrimaryTargetId, "sn_align_core_planning_item", planningItemIdForWorkItem, true)) {
            sn_gf.GFGoalRelationshipSNC.populateWorkItemOfExistingGoalRelationships("sn_align_core_planning_item", planningItemIdForWorkItem, tableName, workItemId);
        } else {
            (new sn_gf.GFGoalRelationship()).createGoalRelationship(currentPrimaryGoalId, currentPrimaryTargetId, tableName, workItemId, true);
        }
    } else if (operation == "update") { //WorkItem is updated
        sn_gf.GoalRelationshipHelper.insertOrUpdateGoalRelationshipWhenWorkItemIsUpdated(previous, current);
    }
};
WorkItemGoalRelationshipHelper.getOtherPrimaryGoalRelationshipOnWorkItem = function(goalId, targetId, entityId) {
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    goalRelationshipGr.addQuery('entity_id', entityId);
    goalRelationshipGr.addQuery('is_primary_goal', true);
    goalRelationshipGr.query();
    while (goalRelationshipGr.next()) {
        if (GFUtil.isGFAdvanceInstalled()) {
            if (goalRelationshipGr.goal == goalId && goalRelationshipGr.target == targetId)
                continue;
        } else {
            if (goalRelationshipGr.goal == goalId)
                continue;
        }
        return goalRelationshipGr;
    }
    return null;
};

WorkItemGoalRelationshipHelper.updatePrimaryGoalOnWorkItem = function(goalId, targetId, entityTableName, entityId) {
    if (!sn_gf.WorkItemGoalRelationshipHelper.isValidWorkItemWithPrimaryGoal(entityTableName))
        return;
    var entityGr = new GlideRecord(entityTableName);
    entityGr.get(entityId);
    if (entityGr.isValidRecord() && entityGr.isValidField('primary_goal')) {
        entityGr.setValue('primary_goal', goalId);
        if (GlidePluginManager.isActive('sn_gfa') && entityGr.isValidField('primary_target')) {
            targetId ? entityGr.setValue('primary_target', targetId) : entityGr.setValue('primary_target','');
        }
        entityGr.update();
    }
};

WorkItemGoalRelationshipHelper.updatePrimaryTargetOnWorkItem = function(goalId, targetId, entityTableName, entityId) {
    if (!sn_gf.WorkItemGoalRelationshipHelper.isValidWorkItemWithPrimaryGoal(entityTableName))
        return;
    var entityGr = new GlideRecord(entityTableName);
    entityGr.get(entityId);
    if (entityGr.isValidRecord() && GlidePluginManager.isActive('sn_gfa') && entityGr.isValidField('primary_target')) {
        entityGr.setValue('primary_target', targetId);
        entityGr.update();
    }
};

WorkItemGoalRelationshipHelper.resetPrimaryGoalOnWorkEntity = function(goalRelationshipRecord) {
    if (!goalRelationshipRecord.isValid() || (goalRelationshipRecord.isValidField('entity_id') && !goalRelationshipRecord.getValue('entity_id')))
        return;
    var workEntityGr = new GlideRecord(goalRelationshipRecord.getValue('table_name'));
    if (workEntityGr.isValid() && workEntityGr.isValidField('primary_goal') && workEntityGr.get(goalRelationshipRecord.getValue('entity_id'))) {
        workEntityGr.setValue('primary_goal', '');
        if (GlidePluginManager.isActive('sn_gfa') && workEntityGr.isValidField('primary_target'))
            workEntityGr.setValue('primary_target', '');
        workEntityGr.update();
    }
};

WorkItemGoalRelationshipHelper.getDisplayNameOfWorkItem = function(goalRelationshipRecord) {
    if (!goalRelationshipRecord.isValid() || (goalRelationshipRecord.isValidField('entity_id') && !goalRelationshipRecord.getValue('entity_id')))
        return;
    var workEntityGr = new GlideRecord(goalRelationshipRecord.getValue('table_name'));
    if (workEntityGr.isValid() && workEntityGr.isValidField('primary_goal') && workEntityGr.get(goalRelationshipRecord.getValue('entity_id'))) {
        return GlideStringUtil.escapeHTML(goalRelationshipRecord.getDisplayValue('entity_id'));
    }

};

WorkItemGoalRelationshipHelper.doesAnyOtherPrimaryGoalExistForWorkItem = function(goalRelationshipRecord) {
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    var goalId = goalRelationshipRecord.goal;
    var targetId = goalRelationshipRecord.target;
    goalRelationshipGr.addQuery('entity_id', goalRelationshipRecord.getValue('entity_id'));
    goalRelationshipGr.addQuery('is_primary_goal', '1');
    goalRelationshipGr.query();
    while (goalRelationshipGr.next()) {
        if (goalRelationshipGr.goal == goalId && goalRelationshipGr.target == targetId)
            continue;
        return true;
    }
    return false;
};

WorkItemGoalRelationshipHelper.isValidWorkItemWithPrimaryGoal = function(tableName) {
    var validWorkItemsWithPrimaryGoal = {
        'pm_project': true,
        'pm_program': true,
        'dmn_demand': true,
        'rm_epic': true,
        'sn_safe_epic': true,
        'rm_feature': true,
    };
    if (GlidePluginManager.isActive('com.sn_align_core')) {
        var planningItemTables = sn_gf.GFAlignCoreUtil.getAllPlanningItemAndStrategicItemTables();
        for (var i = 0; i < planningItemTables.length; i++)
            validWorkItemsWithPrimaryGoal[planningItemTables[i]] = true;
    }

    return (tableName in validWorkItemsWithPrimaryGoal && validWorkItemsWithPrimaryGoal[tableName]);
};
