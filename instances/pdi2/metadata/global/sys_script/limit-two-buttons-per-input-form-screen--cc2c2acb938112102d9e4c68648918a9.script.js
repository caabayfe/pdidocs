(function executeRule(current, previous /*null when async*/) {	
	if(!isAttachedToParameterScreen())
		return;

	const allowed_locations = ['top', 'top_icon'];
	if(!isButtonInstanceLocationAllowed()) {
		gs.addErrorMessage(gs.getMessage('The location {0} is not allowed. Allowed locations are: {1}',  [current.location, getAllowedLocationsString()]));
		current.setAbortAction(true);
		return;
	}

	if(getButtonInstancesCount() >= 2) {
		gs.addErrorMessage(gs.getMessage('The input form screen can have upto two button instances in the following locations: {0}', getAllowedLocationsString()));
		current.setAbortAction(true);
		return;
	}

	if(!checkIfButtonInstanceValidConfiguration()) {
		gs.addErrorMessage(gs.getMessage('The button instance is not correctly configured for save functionality. Please check the button instance configuration. It should link to the action item function. The action item should contain an input screen that links to the same input screen as the button instance parent link. An action item function should contain the "Retain Parent Parameter Screen" attribute set to true'));
		current.setAbortAction(true);
		return;
	}

	function isAttachedToParameterScreen() {
		const screenGR = new GlideRecord('sys_sg_parameter_screen');
		return screenGR.get(current.parent);
	}	

	function isButtonInstanceLocationAllowed() {
		return allowed_locations.includes('' + current.location);
	}

	function getAllowedLocationsString() {
		return allowed_locations.join(', ');
	}

	function getButtonInstancesCount() {
		const gr = new GlideRecord('sys_sg_button_instance');
		gr.addQuery('parent', current.parent);
		gr.addQuery('sys_id', "!=", current.getUniqueValue());
		gr.addQuery('active', true);
		gr.addQuery('location', allowed_locations);
		gr.query();
		return gr.getRowCount();
	}

	function checkIfButtonInstanceValidConfiguration() {
		const buttonId = current.button;
		const lensLauncherButtonType = "lens_launcher";
		if(!buttonId)
			return false;

		if (lensLauncherButtonType === getButtonType(buttonId))
			return true;

		const wbParamterScreenId = current.button?.write_back_action_item?.parameter_screen;
		if(!wbParamterScreenId || current.parent != wbParamterScreenId)
			return false;

		const attrGR = new GlideRecord('sys_sg_button_attribute');
		attrGR.addQuery('button', buttonId);
		attrGR.addQuery('name.name', 'retain_parent_parameter_screen');
		attrGR.addQuery('value', true);
		attrGR.query();
		return attrGR.hasNext();
	}

	function getButtonType(buttonId) {
        const buttonGR = new GlideRecord('sys_sg_button');
        if (buttonGR.get(buttonId))
            return buttonGR.getValue('type');

        return '';
    }

})(current, previous);
