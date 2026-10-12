(function executeRule(current, previous /* null when async */) {
	var isValid = true;
	var msg = '';
	var fields = [];
	if ((!gs.nil(current.getValue('length')) || !gs.nil(current.getValue('width')) || !gs.nil(current.getValue('height'))
        || !gs.nil(current.getValue('depth'))) && gs.nil(current.getValue('dimensions_unit'))) {
		fields.push(current.dimensions_unit.getLabel());
		isValid = false;
	}
	if (!gs.nil(current.getValue('current')) && gs.nil(current.getValue('current_unit'))) {
		fields.push(current.current_unit.getLabel());
		isValid = false;
	}
	if (!gs.nil(current.getValue('rated_power')) && gs.nil(current.getValue('power_unit'))) {
		fields.push(current.power_unit.getLabel());
		isValid = false;
	}
	if (!gs.nil(current.getValue('voltage')) && gs.nil(current.getValue('voltage_unit'))) {
		fields.push(current.voltage_unit.getLabel());
		isValid = false;
	}
	if (!gs.nil(current.getValue('volume')) && gs.nil(current.getValue('volume_unit'))) {
		fields.push(current.volume_unit.getLabel());
		isValid = false;
	}
	if (!gs.nil(current.getValue('weight_decimal')) && gs.nil(current.getValue('weight_unit'))) {
		fields.push(current.weight_unit.getLabel());
		isValid = false;
	}
	if (!isValid) {
		msg = gs.getMessage('Select appropriate measurement for: {0}', fields.toString());
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
}(current, previous));
