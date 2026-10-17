(function executeRule(current, previous /*undefined when async or display*/) {
	new WIFConnectionHelper().cleanup(current);
})(current, typeof previous != 'undefined' ? previous : null);
