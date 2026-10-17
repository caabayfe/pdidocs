(function executeRule(current, previous /*null when async*/ ) {

    var workItems = ['project', 'demand', 'program', 'scrum_epic', 'scrum_feature'];
    var workItemTables = ['pm_project', 'dmn_demand', 'pm_program', 'rm_epic', 'sn_safe_epic', 'rm_feature'];
    var planningItemTables = ["sn_align_core_planning_item", "sn_align_core_demand", "sn_align_core_project", "sn_align_core_program", "sn_align_core_scrum_epic"];
    var arrayUtilObj = new global.ArrayUtil();
    var numberOfWorkItemsPopulated = 0,
        workItemPopulated = '',
        workItemValue = '',
        documentId = current.getValue('entity_id'),
        tableName = current.getValue('table_name'),
        doesEntityIdBelongToPlanningItem = arrayUtilObj.contains(planningItemTables, tableName),
        doesEntityIdBelongToWorkItem = arrayUtilObj.contains(workItemTables, tableName),
        planningItemId = current.getValue('planning_item_id');
    for (var i = 0; i < workItems.length; i++) {
        if (current.isValidField(workItems[i]) && current.getValue(workItems[i])) {
            numberOfWorkItemsPopulated++;
            workItemPopulated = workItems[i];
            workItemValue = current.getValue(workItemPopulated);
            if (documentId != null && !doesEntityIdBelongToPlanningItem && documentId != workItemValue)
                numberOfWorkItemsPopulated++;
        }
    }
    var isAlignmentIntegrationPluginActive = GlidePluginManager.isActive('com.sn_align_cmn_int');
    var areWorkItemAndPlanningItemNotInSync = (numberOfWorkItemsPopulated == 1 && planningItemId != null && isAlignmentIntegrationPluginActive && planningItemId != sn_gf.GFIntegrationUtil.getPlanningItemIdForExecutionEntity(workItemValue));
    var areDocumentIdAndWorkItemNotInSync = (documentId != null && workItemValue != '' && doesEntityIdBelongToPlanningItem && isAlignmentIntegrationPluginActive && documentId != sn_gf.GFIntegrationUtil.getPlanningItemIdForExecutionEntity(workItemValue));
    var areDocumentIdAndPlanningItemNotInSync = (documentId != null && planningItemId != null && doesEntityIdBelongToWorkItem && isAlignmentIntegrationPluginActive && planningItemId != sn_gf.GFIntegrationUtil.getPlanningItemIdForExecutionEntity(documentId)) || (documentId != null && planningItemId != null && doesEntityIdBelongToPlanningItem && planningItemId != documentId);
    if (numberOfWorkItemsPopulated > 1 || areWorkItemAndPlanningItemNotInSync || areDocumentIdAndWorkItemNotInSync || areDocumentIdAndPlanningItemNotInSync) {
        var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
		var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
        gs.addErrorMessage(gs.getMessage('A {0}/{1} relationship can be created with only one of the items (Project, Demand, Program, Epic, Scrum feature, or Planning item) at a time. Ensure that only one of these fields is populated.', [GlideStringUtil.escapeHTML(goalLabel),GlideStringUtil.escapeHTML(targetLabel)]));
        current.setAbortAction(true);
    } else {
        current.setValue('is_work_item', true);
    }

})(current, previous);
