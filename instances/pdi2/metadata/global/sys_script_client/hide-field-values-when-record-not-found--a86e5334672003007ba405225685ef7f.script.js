function onLoad() {
	var recordValidationStepConfig = '1f39a288df60220062fe6c7a4df2639d';
	var stepConfig = g_form.getValue('step_config');

	// return if not a record validation step
	if (recordValidationStepConfig.indexOf(stepConfig) == -1)
		return;

	var assertTypeElement = gel('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assert_type');
	if (!assertTypeElement)
		return;

	var assertValue = g_form.getValue('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assert_type');
	var fieldValues = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.field_values');

	if (assertValue == 'record_not_found') {
			// Hide field values if form loads with assertValue record_not_found
			if (fieldValues) {
				fieldValues.setAttribute('style', 'display:none');
				fieldValues.removeClassName("is-required");
			}
	} else {
			// Show field values if form loads without assertValue record_not_found
			if (fieldValues) {
				fieldValues.setAttribute('style', '');
				fieldValues.addClassName("is-required");
			}
	}

	var onChangeFunction = assertTypeElement.onchange;
	assertTypeElement.onchange = function() {
		if (onChangeFunction)
			onChangeFunction();
		fieldValues = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.field_values');
		assertValue = g_form.getValue('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assert_type');
		if (assertValue == 'record_not_found') {
			// Hide field values
			if (fieldValues) {
				fieldValues.setAttribute('style', 'display:none');
				fieldValues.removeClassName("is-required");
			}
		} else {
			// Show field values
			if (fieldValues) {
				fieldValues.setAttribute('style', '');
				fieldValues.addClassName("is-required");
			}
		}
	};
}
