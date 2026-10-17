(function executeRule(current, previous /*null when async*/ ) {

    var tableToFieldMapping = {
        'dmn_demand': 'demand',
        'pm_project': 'project',
        'pm_program': 'program',
        'rm_epic': 'scrum_epic',
        'sn_safe_epic': 'scrum_epic',
        'rm_feature': 'scrum_feature',
    };
    var planningItemTables = GlidePluginManager.isActive('com.sn_align_core') ? sn_gf.GFAlignCoreUtil.getAllPlanningItemAndStrategicItemTables() : [];
    var tableName = current.getValue("table_name");
    var entityId = current.getValue('entity_id');
    if (tableName in tableToFieldMapping && current.isValidField(tableToFieldMapping[tableName]) & current.getValue(tableToFieldMapping[tableName]) == null) {
        current.setValue(tableToFieldMapping[tableName], entityId);
        current.setValue('is_work_item', true);
    } else if ((new global.ArrayUtil()).contains(planningItemTables, tableName) && current.isValidField("planning_item_id") && current.getValue("planning_item_id") == null) {
        if (sn_gf.GFAlignCoreUtil.isValidPlanningItem(entityId))
            current.setValue("planning_item_id", entityId);
        current.setValue('is_work_item', true);
    }

})(current, previous);
