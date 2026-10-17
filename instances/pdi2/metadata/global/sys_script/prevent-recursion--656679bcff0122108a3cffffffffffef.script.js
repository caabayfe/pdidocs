(function executeRule(current, previous /*null when async*/) {
	var rt = new RecursionTester('dp_app_profile_dataclass', 'parent');
	if (rt.isRecursive(current)) {
		current.setAbortAction(true);
		current.parent.setError('Invalid Parent');
		gs.addErrorMessage(sn_i18n.Message.getMessage('com.glide.data_classification', 'The selected parent introduces a circular reference'));
	}
})(current, previous);
