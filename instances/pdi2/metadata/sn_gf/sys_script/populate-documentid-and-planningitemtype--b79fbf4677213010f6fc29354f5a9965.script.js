(function executeRule(current, previous /*null when async*/ ) {
	
    var workItemFieldToTableMap = {
        'project': 'pm_project',
        'demand': 'dmn_demand',
        'program': 'pm_program',
        'scrum_epic': 'rm_epic',
        'scrum_feature': 'rm_feature'
    };
    var isAnyWorkItemPopulated = false;
    for (var workItemField in workItemFieldToTableMap) {
        if (current.isValid(workItemField) && current.getValue(workItemField)) {
            if (current.getValue(workItemField) != current.getValue('entity_id')) {
				current.setValue('table_name', workItemFieldToTableMap[workItemField]);
                current.setValue('entity_id', current.getValue(workItemField));
            }
            isAnyWorkItemPopulated = true;
            break;
        }
    }
    var planningItemId = current.getValue('planning_item_id');
	
	if(global.JSUtil.notNil(planningItemId) && global.JSUtil.nil(current.getValue('planning_item_type'))) 
		current.setValue('planning_item_type', current.planning_item_id.getRefRecord().getValue('sys_class_name'));
	
    if (!isAnyWorkItemPopulated && planningItemId != null && planningItemId != current.getValue('entity_id')) {
        current.setValue('table_name', sn_gf.GFAlignCoreUtil.getPlanningItemSysClassName(planningItemId));
        current.setValue('entity_id', planningItemId);
    }
})(current, previous);
