(function executeRule(current, previous /* null when async */) {
	var isValid = true;
	var msg = '';
	var fields = [];
	if (current.getValue('length') < 0) {
		fields.push(current.length.getLabel());
		isValid = false;
	}
	if (current.getValue('width') < 0) {
		fields.push(current.width.getLabel());
		isValid = false;
	}
	if (current.getValue('height') < 0) {
		fields.push(current.height.getLabel());
		isValid = false;
	}
	if (current.getValue('depth') < 0) {
		fields.push(current.depth.getLabel());
		isValid = false;
	}
	if (current.getValue('current') < 0) {
		fields.push(current.current.getLabel());
		isValid = false;
	}
	if (current.getValue('rated_power') < 0) {
		fields.push(current.rated_power.getLabel());
		isValid = false;
	}
	if (current.getValue('voltage') < 0) {
		fields.push(current.voltage.getLabel());
		isValid = false;
	}
	if (current.getValue('volume') < 0) {
		fields.push(current.volume.getLabel());
		isValid = false;
	}
	if (current.getValue('weight_decimal') < 0) {
		fields.push(current.weight_decimal.getLabel());
		isValid = false;
	}
	if (!isValid) {
		msg = gs.getMessage('Negative values are not allowed in the following fields: {0}', fields.toString());
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
}(current, previous));
