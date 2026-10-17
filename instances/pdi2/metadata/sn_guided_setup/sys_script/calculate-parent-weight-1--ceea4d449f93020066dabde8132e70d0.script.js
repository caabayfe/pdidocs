(function executeRule(current, previous /*null when async*/) {

	new GuidedSetupUtilSNC().updateParentWeight(current.parent);

})(current, previous);
