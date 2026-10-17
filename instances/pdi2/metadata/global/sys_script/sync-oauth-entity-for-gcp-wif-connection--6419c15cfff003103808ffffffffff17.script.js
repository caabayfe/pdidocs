(function executeRule(current, previous /*undefined when async or display*/) {
	new WIFConnectionHelper().updateGcp(current);
})(current, typeof previous != 'undefined' ? previous : null);
