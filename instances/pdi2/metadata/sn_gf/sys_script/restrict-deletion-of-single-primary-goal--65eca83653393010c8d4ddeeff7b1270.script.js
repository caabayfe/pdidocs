(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (!GFGoalRelationshipSNC.isDeletionOfPrimaryGoalAllowed(current)) {
        var displayLabel = sn_gf.GFUtil.getDisplayLabel();
        var goalAndTarget = GlideStringUtil.escapeHTML(current.getDisplayValue('goal'));
        var target = GlideStringUtil.escapeHTML(current.getDisplayValue('target'));
        if (target)
            goalAndTarget += '/' + target;
        gs.addErrorMessage(gs.getMessage("Relationship between the primary {1} ({2}) and work item ({0}) can’t be removed . However, you can make another {1} as primary and then remove the existing relationship.", [GlideStringUtil.escapeHTML(WorkItemGoalRelationshipHelper.getDisplayNameOfWorkItem(current)), GlideStringUtil.escapeHTML(displayLabel), GlideStringUtil.escapeHTML(goalAndTarget)]));
        current.setAbortAction(true);
    } else if (!WorkItemGoalRelationshipHelper.doesAnyOtherPrimaryGoalExistForWorkItem(current)) {
        WorkItemGoalRelationshipHelper.resetPrimaryGoalOnWorkEntity(current);
    }

})(current, previous);
