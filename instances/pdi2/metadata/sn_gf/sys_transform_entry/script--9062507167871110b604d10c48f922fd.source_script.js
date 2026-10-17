answer = (function transformEntry(source) {
    if (gs.nil(source.u_assigned_entity_type) || gs.nil(source.u_assigned_entity)) return "";
    return GoalImportUtil.getAssignedEntityType(source.u_assigned_entity_type.toString());
})(source);
