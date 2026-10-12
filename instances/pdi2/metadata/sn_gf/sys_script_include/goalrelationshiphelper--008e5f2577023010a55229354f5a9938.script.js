var GoalRelationshipHelper = Class.create();

GoalRelationshipHelper.insertOrUpdateGoalRelationshipWhenWorkItemIsUpdated = function(previous, current) {
    var previousPrimaryGoalId = previous.getValue('primary_goal');
    var currentPrimaryGoalId = current.getValue('primary_goal');
    var previousPrimaryTargetId = GlidePluginManager.isActive('sn_gfa') ? previous.getValue('primary_target') : '';
    var currentPrimaryTargetId = GlidePluginManager.isActive('sn_gfa') ? current.getValue('primary_target') : '';
    var tableName = sn_gf.GFGoalRelationshipSNC.getWorkItemTableName(current);
    var workItemId = current.getUniqueValue();

    var previousGoalRelationship = new sn_gf.GFGoalRelationship(previousPrimaryGoalId, previousPrimaryTargetId, tableName, workItemId);

    var isPrimaryGoalCleared = (previousPrimaryGoalId != currentPrimaryGoalId && currentPrimaryGoalId == null);
    // When Primary Target and it's associated Goal has only 1 relationship with work item, and primary target is cleared from planning item
    // This will only work, when Primary Goal hasn't been changed.
    var isOnlyPrimaryTargetGotCleared = (previousPrimaryGoalId == currentPrimaryGoalId &&
        previousPrimaryTargetId != currentPrimaryTargetId && !currentPrimaryTargetId &&
        !previousGoalRelationship.hasAnotherWorkItemRelationshipOnSameGoal());

    if (isPrimaryGoalCleared) {
        previousGoalRelationship.deleteGoalRelationship();
    } else if (isOnlyPrimaryTargetGotCleared) {
        // In this case, primary goal stays unchanged, so we directly update the record
        previousGoalRelationship.deleteTargetRelationship();
    } else {
        /*
        1. isWorkItemPrimaryGoalUpdatedByUser is TRUE, when User directly updates the Primary Goal column on Work Item
        2. isWorkItemPrimaryGoalUpdatedByUser is FALSE, when an existing/new Goal Relationship is made Primary Goal, \
            then WorkItem's Primary Goal will be updated (INDIRECTLY, through another BR on Goal Relationship) \
            after is_primary_goal of Previous Goal Relationship is made false.
        */
        var isWorkItemPrimaryGoalUpdatedByUser = previousGoalRelationship.isPrimaryGoalChecked();
        if (previousPrimaryGoalId == null || isWorkItemPrimaryGoalUpdatedByUser) {
            var currentGoalRelationship = new sn_gf.GFGoalRelationship(currentPrimaryGoalId, currentPrimaryTargetId, tableName, workItemId);
            var workItemGoalRelationshipExists = currentGoalRelationship.goalRelationshipId != '';
            if (workItemGoalRelationshipExists) {
                currentGoalRelationship.makeGoalRelationshipPrimary();
            } else if (!sn_gf.GFGoalRelationshipSNC.checkGoalRelationshipRec(currentPrimaryGoalId, currentPrimaryTargetId, tableName, workItemId, true)) {
                // create new goal relationship
                currentGoalRelationship.createGoalRelationship(currentPrimaryGoalId, currentPrimaryTargetId, tableName, workItemId, true);
            }
        }
    }
};

GoalRelationshipHelper.doesPrimaryTargetExistOnEmptyPrimaryGoal = function(current) {
    if (GlidePluginManager.isActive('sn_gfa') &&
        !current.getValue("primary_goal") &&
        current.getValue("primary_target")) {
        return gs.getMessage("Primary goal cannot be empty when Primary target is populated.");
    }
    return false;
};

GoalRelationshipHelper.isPrimaryTargetNotAssociatedWithPrimaryGoal = function(current, previous) {
    if (GlidePluginManager.isActive('sn_gfa') &&
        current.getValue("primary_goal") &&
        current.getValue("primary_target") &&
        current.getValue("primary_goal") !== current.primary_target.getRefRecord().getValue("goal")) {
        return gs.getMessage("The selected Primary target ({0}) is not associated with the selected Primary goal ({1}).",
            [GlideStringUtil.escapeHTML(current.getDisplayValue('primary_target')), GlideStringUtil.escapeHTML(current.getDisplayValue("primary_goal"))]);
    }
    return false;
};

GoalRelationshipHelper.isInvalidRemovalOfPrimaryGoal = function(current, previous) {
    if (previous.getValue("primary_goal") != current.getValue("primary_goal") &&
        !current.getValue("primary_goal")) {
        var goalRelationGr = new sn_gf.GFGoalRelationship(previous.getValue('primary_goal'),
            GlidePluginManager.isActive('sn_gfa') ? previous.getValue('primary_target') : '',
            current.getTableName(), current.getUniqueValue());
        if (goalRelationGr.hasAnotherWorkItemRelationship()) {
            var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
            return gs.getMessage("You must make another {0} as primary before deleting the selected {0} relationship record.", GlideStringUtil.escapeHTML(goalLabel));
        }
    }
    return false;
};

GoalRelationshipHelper.isDuplicatePrimaryGoal = function(current, previous) {

    if (GlidePluginManager.isActive('sn_gfa')) {
        var previousPrimaryGoalId = previous.getValue('primary_goal');
        var currentPrimaryGoalId = current.getValue('primary_goal');
        var previousPrimaryTargetId = previous.getValue('primary_target');
        var currentPrimaryTargetId = current.getValue('primary_target');
        var tableName = sn_gf.GFGoalRelationshipSNC.getWorkItemTableName(current);
        var workItemId = current.getUniqueValue();

        // Handle Special Case : When Primary Target and it's associated Goal has only 1 relationship with work item, 
        // and primary target is cleared from planning item. This will only work, when Primary Goal hasn't been changed.
        if (previousPrimaryGoalId == currentPrimaryGoalId &&
            previousPrimaryTargetId != currentPrimaryTargetId && !currentPrimaryTargetId &&
            !(new sn_gf.GFGoalRelationship(previousPrimaryGoalId, previousPrimaryTargetId,
                tableName, workItemId)).hasAnotherWorkItemRelationshipOnSameGoal()) {
            return false;
        } else if (currentPrimaryGoalId && current.isValidField("primary_target") && !currentPrimaryTargetId &&
            (new sn_gf.GFGoalRelationship(currentPrimaryGoalId, currentPrimaryTargetId, tableName,
                workItemId)).hasAnotherWorkItemRelationshipOnSameGoal()) {

            var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE);
            var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE);
            return gs.getMessage("As a {0}/{1} relationship with goal ({2}) already exists for this planning item, a standalone Goal relationship with goal ({2}) can't be created.",
                [GlideStringUtil.escapeHTML(goalLabel), GlideStringUtil.escapeHTML(targetLabel), GlideStringUtil.escapeHTML(current.getDisplayValue('primary_goal'))]);
        }
    }
    return false;
};

GoalRelationshipHelper.setPrimaryGoalFromPrimaryTarget = function(current) {
    let goalRecord = current.primary_target.getRefRecord().getValue("goal");
    if (current.getValue("primary_goal") !== goalRecord) {
        current.setValue("primary_goal", goalRecord);
    }
};

GoalRelationshipHelper.checkInvalidPrimaryGoalTargetUpdate = function(current, previous) {
    return (sn_gf.GoalRelationshipHelper.doesPrimaryTargetExistOnEmptyPrimaryGoal(current) ||
        sn_gf.GoalRelationshipHelper.isPrimaryTargetNotAssociatedWithPrimaryGoal(current, previous) ||
        sn_gf.GoalRelationshipHelper.isInvalidRemovalOfPrimaryGoal(current, previous) ||
        sn_gf.GoalRelationshipHelper.isDuplicatePrimaryGoal(current, previous));
};
