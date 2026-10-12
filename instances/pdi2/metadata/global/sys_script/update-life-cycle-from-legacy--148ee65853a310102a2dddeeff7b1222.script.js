(function executeRule(current, previous /* null when async */) {
	new global.LifeCycleUtil().updateFromLegacy(current.getTableName(), current);
}(current, previous));
