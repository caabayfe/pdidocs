(function executeRule(current, previous /*null when async*/) {

	// depending on template type, ensure that there are associated template input/output variables	
	try {
		var _TemplateIOValidator = new TemplateIOValidator(current);
		_TemplateIOValidator.validateMandatoryTemplateIOs();
	} catch (ex) {
		gs.addErrorMessage(ex.message);
		current.setAbortAction(true);
	}

})(current, previous);
