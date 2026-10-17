answer = (function transformEntry(source) {
    if (gs.nil(source.u_assigned_entity_type) || gs.nil(source.u_assigned_entity)) return "";

    var assignedEntityTypeResult = GoalImportUtil.getAssignedEntityType(source.u_assigned_entity_type.toString());
    var assignedEntityGr = new GlideRecord(assignedEntityTypeResult);
    if (assignedEntityTypeResult) {
        var searchParam = assignedEntityGr.isValidField('name') ? 'name' :
            assignedEntityGr.isValidField('short_description') ? 'short_description' : '';
        assignedEntityGr.addQuery(searchParam, source.u_assigned_entity);
        assignedEntityGr.query();
        if (assignedEntityGr.next()) return assignedEntityGr.sys_id;
    }
    return "";
})(source);
