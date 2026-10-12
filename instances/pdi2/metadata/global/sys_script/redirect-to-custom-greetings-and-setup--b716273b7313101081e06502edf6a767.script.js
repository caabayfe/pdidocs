(function executeRule(current, previous /*null when async*/) {
	var stack = gs.getSession().getStack();
	var lastUrl = stack.pop();
	if (lastUrl.indexOf('$sn-va-web-client-app.do') === -1) {
		stack.push(lastUrl);
	}
})(current, previous);
