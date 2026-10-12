(function executeRule(current, previous /*null when async*/ ) {
    var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE);
    var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE);
    if (current.isValidField('target') && current.getValue('target') == null) {
        if (sn_gfa.GFAGoalRelationshipsUtils.goalTargetRelationshipExists(current.getValue('goal'), current.getValue('entity_id'))) {
            gs.addErrorMessage(gs.getMessage("As a {0}/{1} relationship with goal ({2}) already exists for this planning item, a standalone Goal relationship with goal ({2}) cannot be created.",
                [GlideStringUtil.escapeHTML(goalLabel), GlideStringUtil.escapeHTML(targetLabel), GlideStringUtil.escapeHTML(current.getDisplayValue('goal'))]));
            current.setAbortAction(true);
        }
    }
    if (GFUtil.checkDuplicateWorkItem(current)) {
        var displayLabel = sn_gf.GFUtil.getDisplayLabel();
        gs.addErrorMessage(gs.getMessage("{0} relationship with the selected work item already exists.", GlideStringUtil.escapeHTML(displayLabel)));

		var entityField = sn_gf.GFGoalRelationshipSNC.tableToFieldMapping && sn_gf.GFGoalRelationshipSNC.tableToFieldMapping[current.table_name];
        current.setValue('table_name', "");
        current.setValue('entity_id', "");
		if(entityField)
			current.setValue(entityField, "");

        current.setAbortAction(true);
    }
})(current, previous);
