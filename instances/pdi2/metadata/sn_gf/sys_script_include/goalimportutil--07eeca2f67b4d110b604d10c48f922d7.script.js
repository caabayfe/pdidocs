var GoalImportUtil = Class.create();

GoalImportUtil.createGR = function(obj, fieldMap) {
    var newGr = new GlideRecord(obj);
    newGr.initialize();
    for (var key in fieldMap)
        newGr.setValue(key, fieldMap[key]);
    newGr.insert();
    return newGr.sys_id;
};

GoalImportUtil.querySingleGR = function(obj, fieldMap) {
    var gr = new GlideRecord(obj);
    for (var key in fieldMap)
        gr.addQuery(key, fieldMap[key]);
    gr.query();
    return gr.next() ? gr.sys_id : false;
};

GoalImportUtil.getCoalesceFields = function(mapSysId) {
    var coalesceFields = {};
    var tEntriesGr = new GlideRecord('sys_transform_entry');
    tEntriesGr.addQuery('map.sys_id', mapSysId);
    tEntriesGr.addQuery('coalesce', '1');
    tEntriesGr.query();
    while (tEntriesGr.next())
        coalesceFields[tEntriesGr.getValue('target_field')] = tEntriesGr.getValue('source_field').replace('u_', '');
    return !global.JSUtil.isEmpty(coalesceFields) ? coalesceFields : {};
};

GoalImportUtil.getAssignedEntityType = function(sheetAssignedEntityType) {
    var tableName = "";
    var assignedEntityTypeResult = "";

    var dbo = new GlideRecord('sys_db_object');
    dbo.addEncodedQuery("label=" + sheetAssignedEntityType + "^ORname=" + sheetAssignedEntityType);
    dbo.query();
    if (dbo.next())
        tableName = dbo.name;

    if (tableName) {
        var assignedEntityConfig = new GlideRecord(GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
        assignedEntityConfig.addEncodedQuery("assigned_entity_table=" + tableName);
        assignedEntityConfig.query();
        if (assignedEntityConfig.next()) assignedEntityTypeResult = assignedEntityConfig.assigned_entity_table;
    }
    return assignedEntityTypeResult;
};
