answer = (function transformEntry(source) {
    var goalGrParams = {};
    if (!source.u_parent_goal_name) return "";
    if (!source.u_parent_goal_owner) goalGrParams.owner = gs.getUserID(); //login userId in case of Parent Goal Owner is Empty  
    goalGrParams.name = source.u_parent_goal_name;
    var coalesceFields = GoalImportUtil.getCoalesceFields(map.sys_id); //get current transformMap's coalesce columns

    for (var key in coalesceFields) {
        if (key != 'name') {
            var refTable = target.getElement(key).getReferenceTable();
            var parentFieldValue = source.getElement('u_parent_goal_' + key);
            if (global.JSUtil.notNil(parentFieldValue)) {
                var grParams = {'name': parentFieldValue}; //getReferenceFields of Parent Goal by name             
                goalGrParams[key] = global.JSUtil.notNil(refTable) ? GoalImportUtil.querySingleGR(refTable, grParams) || GoalImportUtil.createGR(refTable, grParams) : parentFieldValue;
            }
        }
    }
    return GoalImportUtil.querySingleGR(GoalFrameworkConstants.GOAL_TABLE, goalGrParams) || GoalImportUtil.createGR(GoalFrameworkConstants.GOAL_TABLE, goalGrParams);
})(source);
