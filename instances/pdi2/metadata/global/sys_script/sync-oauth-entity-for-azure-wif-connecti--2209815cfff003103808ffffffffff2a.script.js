(function executeRule(current, previous /*undefined when async or display*/) {
	new WIFConnectionHelper().updateAzure(current);
})(current, typeof previous != 'undefined' ? previous : null);
