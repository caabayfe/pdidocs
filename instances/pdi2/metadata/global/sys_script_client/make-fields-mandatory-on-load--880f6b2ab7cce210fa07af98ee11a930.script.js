function onLoad() {
	if (g_form.isNewRecord()) {
		return;
	}
	if (g_form.getValue('ci') === '' && g_form.getValue('substatus') !== 'pre_allocated') {
		return;
	}

	var mandatoryField = [];
	var onLoadMandatory = [];
	var field = g_scratchpad.formMandatoryFields[0];

	for (var i = 0; i < field.length; i++) {
		if (g_form.hasField(field[i]) && g_form.isVisible(field[i])) {
			mandatoryField.push(field[i]);
		}
	}

	for (var j = 0; j < mandatoryField.length; j++) {
		onLoadMandatory.push(g_form.isMandatory(mandatoryField[j]));
	}

	g_scratchpad.formMandatoryFields = [mandatoryField, onLoadMandatory];
}
