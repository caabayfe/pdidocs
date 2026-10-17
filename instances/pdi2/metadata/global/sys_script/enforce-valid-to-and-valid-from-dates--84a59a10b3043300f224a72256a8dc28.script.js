(function executeRule(current, previous /*null when async*/) {

	var valid_to = current.getValue('valid_to');
	var valid_from = current.getValue('valid_from');
	
	if (!valid_to || !valid_from)
		return;
	
	valid_to = new GlideDateTime(valid_to);
	valid_from = new GlideDateTime(valid_from);
	
	if (valid_to.before(valid_from)){
		gs.addErrorMessage(gs.getMessage('{0} cannot be set before {1}', [current.getElement('valid_to').getLabel(), current.getElement('valid_from').getLabel().toLowerCase()]));
		current.setAbortAction(true);
	}
	

})(current, previous);
