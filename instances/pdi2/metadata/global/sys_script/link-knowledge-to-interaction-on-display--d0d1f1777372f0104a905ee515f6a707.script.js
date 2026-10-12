(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord())
		return;
	new InteractionRelationshipUtil().linkToParentInteraction(current, "Viewed");
})(current, previous);
