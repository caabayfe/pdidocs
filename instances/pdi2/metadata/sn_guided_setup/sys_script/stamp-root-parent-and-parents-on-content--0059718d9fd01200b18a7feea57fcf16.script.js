(function executeRule(current, previous /*null when async*/) {
	var util = new GuidedSetupUtilSNC();

	util.stampParentsInContent(current);
	util.stampRootParentInContent(current);

	if (previous != null
		&& previous.getValue(util.ATTR_ROOT_PARENT) != current.getValue(util.ATTR_ROOT_PARENT))
		util.stampRootParentOnChildren(current);

})(current, previous);
