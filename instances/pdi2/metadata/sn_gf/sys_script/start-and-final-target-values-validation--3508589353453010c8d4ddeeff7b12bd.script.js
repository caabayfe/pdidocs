(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var startValueLabel = current.getElement('base_value').getLabel();
	var finalTargetValueLabel = current.getElement('target_value').getLabel();

	if(current.getValue('type') == 'maximize' && (parseFloat(current.getValue('base_value')) > parseFloat(current.getValue('target_value')))){
		gs.addErrorMessage(gs.getMessage('{0} should be lesser than {1} when Type is selected as Maximize.',[startValueLabel, finalTargetValueLabel]));
		current.setAbortAction(true);
	}
	else if(current.getValue('type') == 'minimize' && (parseFloat(current.getValue('base_value')) < parseFloat(current.getValue('target_value')))){
		gs.addErrorMessage(gs.getMessage('{0} should be lesser than {1} when Type is selected as Minimize.', [finalTargetValueLabel, startValueLabel]));
		current.setAbortAction(true);
	}

})(current, previous);
