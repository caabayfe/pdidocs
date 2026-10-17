answer = (function transformEntry(source) {
    var goalGrParams = {};
    if (!source.u_goal_name) return "";
    if (!source.u_goal_owner) goalGrParams.owner = gs.getUserID(); //login userId in case of Goal Owner is Empty
    goalGrParams.name = source.u_parent_goal_name;
    var coalesceFields = GoalImportUtil.getCoalesceFields(GoalImportUtil.querySingleGR('sys_transform_map', {'source_table': 'imp_sn_gf_goal'})); //get Goal Transform Map's coalesce columns

    for (var key in coalesceFields) {
        var refTable = key != 'name' ? new GlideRecord('sn_gf_goal').getElement(key).getReferenceTable() : '';
        var goalFieldValue = source.getElement('u_goal_' + key);
        if (global.JSUtil.notNil(goalFieldValue)) {
            var grParams = {'name': goalFieldValue}; //getReferenceFields of Goal by name  
            goalGrParams[key] = global.JSUtil.notNil(refTable) ? GoalImportUtil.querySingleGR(refTable, grParams) || GoalImportUtil.createGR(refTable, grParams) : goalFieldValue;
        }
    }
    return GoalImportUtil.querySingleGR(GoalFrameworkConstants.GOAL_TABLE, goalGrParams) || GoalImportUtil.createGR(GoalFrameworkConstants.GOAL_TABLE, goalGrParams);
})(source);
