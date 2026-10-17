var GoalConfigUtil = Class.create();

GoalConfigUtil.getCalendarType = function() {
    if(!GlideApplicationProperty.getValue(GoalFrameworkConstants.CALENDAR_TYPE_PROPERTY) || !GlidePluginManager.isActive('com.snc.fiscal_calendar')) 
		return GoalFrameworkConstants.BUSINESS_CALENDAR_ENTRY_TABLE;
	
	return GlideApplicationProperty.getValue(GoalFrameworkConstants.CALENDAR_TYPE_PROPERTY);
};
GoalConfigUtil.isWeightedAverageEnabled = function() {
    var weightedAverageEnabled = GlideApplicationProperty.getValue(GoalFrameworkConstants.WEIGHTED_AVERAGE_ENABLED);
    return weightedAverageEnabled === "true";
};

GoalConfigUtil.isGoalDeletionAllowed = function() {
    var goalDeletionAllowed = GlideApplicationProperty.getValue(GoalFrameworkConstants.GOAL_DELETION_ALLOWED);
    return goalDeletionAllowed === "true";
};

GoalConfigUtil.isTargetDeletionAllowed = function() {
    var targetDeletionAllowed = GlideApplicationProperty.getValue(GoalFrameworkConstants.TARGET_DELETION_ALLOWED);
    return targetDeletionAllowed === "true";
};
