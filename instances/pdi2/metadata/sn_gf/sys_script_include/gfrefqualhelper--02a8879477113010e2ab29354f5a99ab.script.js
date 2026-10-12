var GFRefQualHelper = Class.create();

GFRefQualHelper.getCalendarPeriodsForGoal = function(current) {
    var calendarType = sn_gf.GoalConfigUtil.getCalendarType();
    if (calendarType == sn_gf.GoalFrameworkConstants.FISCAL_PERIOD_TABLE)
        return 'sys_class_name=' + calendarType;
    var sysIdsOfBusinessCalendarsRelatedToGregCalendarGroup = [sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_WEEK, sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_MONTH, sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_QUARTER, sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_YEAR];
    return 'calendarIN' + sysIdsOfBusinessCalendarsRelatedToGregCalendarGroup.join();
};

GFRefQualHelper.getCalendarPeriodsForStrategy = function(current) {
    var calendarType = sn_gf.GoalConfigUtil.getCalendarType();
    if (calendarType == sn_gf.GoalFrameworkConstants.FISCAL_PERIOD_TABLE)
        return 'sys_class_name=' + calendarType;
    var sysIdsOfBusinessCalendarsRelatedToGregCalendarGroup = [sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_WEEK, sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_MONTH, sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_QUARTER, sn_gf.GoalFrameworkConstants.BUSINESS_CALENDAR_YEAR];
    return 'calendarIN' + sysIdsOfBusinessCalendarsRelatedToGregCalendarGroup.join();
};

GFRefQualHelper.getParentIdsForGoal = function(current) {
    return 'sys_idNOT IN' + current.sys_id + "^active=true"; //to avoid circular loop
};

GFRefQualHelper.getParentIdsForStrategy = function(current) {
    return 'sys_idNOT IN' + current.sys_id; //to avoid circular loop
};

GFRefQualHelper.getStrategiesForGoal = function(goalGR) {
    return '';
};

GFRefQualHelper.getValidGoalsForPlanningItemOfGoalRel = function(goalRelGr) {
    return '';
};

GFRefQualHelper.getValidGoalsForPlanningItem = function(planningItemGr) {
    return "active=true";
};

GFRefQualHelper.getValidPlanningItemsFromGoalPlanningOrg = function(goalRelGr) {
    if (GlidePluginManager.isActive('com.sn_align_ws')) {
        var planningItemType = goalRelGr.getValue('planning_item_type');
        return 'sys_class_name=' + planningItemType;
    }

    return '';
};

//here work item is (project, demand, program, epic ) 
//ref qualifier for primary goal
GFRefQualHelper.getValidGoalsForWorkItem = function(workItemGr) {
    return "active=true";
};

//here work item is (project, demand, program, epic ) 
//ref qualifier for primary target
GFRefQualHelper.getValidTargetsForWorkItem = function(workItemGr) {
    if (workItemGr.getValue('primary_goal')) {
        return "goal=" + workItemGr.getValue('primary_goal')+ "^active=true";
    }
    return "active=true";
};

GFRefQualHelper.getValidGoalsBasedOnWorkItemPopulated = function(goalRel) { //goalRel instance of goal relationship
    return '';
};

//ref qualifier on Goal relationship record goal field, to get planning org from work / planning items
GFRefQualHelper.getValidGoalsForWorkItemOnGoalRelRecord = function(goalRel) {
    return "active=true";
};

//ref qualifier for work / planning items to get planning org from selected goal
GFRefQualHelper.getValidWorkItemsFromGoalPlanningOrg = function(goalRel, tableName) {
    return '';
};

GFRefQualHelper.getFeatureRecords = function(goalRel) {
    return 'sys_class_name=' + sn_gf.GoalFrameworkConstants.FEATURE_TABLE + '^ORsys_class_name=' + sn_gf.GoalFrameworkConstants.SAFE_FEATURE_TABLE;
};
