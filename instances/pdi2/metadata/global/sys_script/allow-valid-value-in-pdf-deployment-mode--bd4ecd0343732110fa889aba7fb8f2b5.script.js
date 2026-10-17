(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	if (gs.nil(current.value))
		return;
	var currValue = current.value.toLowerCase();
	if (currValue != "instance" && currValue != "service") {
		gs.addErrorMessage(gs.getMessage('This property dictates whether the HTML to PDF conversion happens on this same instance(INSTANCE) or on internally hosted ServiceNow shared service(SERVICE).Valid values for this property are : INSTANCE, SERVICE'));
		current.setAbortAction(true);
	}

})(current, previous);
