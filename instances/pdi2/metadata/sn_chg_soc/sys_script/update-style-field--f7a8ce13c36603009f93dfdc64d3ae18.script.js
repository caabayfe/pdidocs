(function executeRule(current, previous /*null when async*/) {
	new SoCStyleRule(current, gs).refreshStyle();
})(current, previous);
