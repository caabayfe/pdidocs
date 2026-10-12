(function executeRule(current, previous /*undefined when async or display*/ ) {

	var result = new StdChangeTaskUtils().validateTemplateValueCompliance(current);
	if (!result)
		current.setAbortAction(true);
	
})(current, typeof previous != 'undefined' ? previous : null);
