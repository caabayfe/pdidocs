(function executeRule(current, previous /*null when async*/) {
	var validator = new MobileTypographyValidator();
	var result = validator.isValidName(current.getValue('value'));
	
	if (result === false)
		current.setAbortAction(true);

})(current, previous);
