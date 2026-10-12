(function executeRule(current, previous /* null when async */) {
	new global.LifeCycleUtil().syncLegacyAndCSDMFields(current, previous);
}(current, previous));
