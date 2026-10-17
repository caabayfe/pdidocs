(function executeRule(current, previous /*null when async*/) {
	new global.InteractionHelpRequestUtil().cancelHelpRequest(current);
})(current, previous);
