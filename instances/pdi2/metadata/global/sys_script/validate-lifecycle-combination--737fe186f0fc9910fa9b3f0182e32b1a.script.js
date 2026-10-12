(function executeRule(current, previous) {
	new global.LifeCycleUtil().validateUI(previous, current);
}(current, previous));
