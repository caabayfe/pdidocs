(function executeRule(current, previous /*null when async*/) {
		var pb = new global.PlaybookUtils();
	
		// only run this if we weren't triggered by a clone
		if (!current.default_activity_ui) {
			var newDefaultActivityUI = pb.createNewBlankActivityUI(current);
			current.setValue('default_activity_ui', newDefaultActivityUI.getUniqueValue());
		}
		return current;
})(current, previous);
