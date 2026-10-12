function onLoad() {
	var clickModalStepConfig = '22aed143dfe0220062fe6c7a4df2639d';
	var stepConfig = g_form.getValue('step_config');

	// return if not a click modal step
	if (clickModalStepConfig.indexOf(stepConfig) == -1)
		return;

    // hide extra spacing in assertion annotation
	var makeSpacingOk = gel('make_spacing_ok');
	if (makeSpacingOk)
		makeSpacingOk.setAttribute('style', 'display:none');

	var assertTypeElement = gel('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assert_type');
	if (!assertTypeElement)
		return;

	var assertValue = g_form.getValue('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assert_type');
	var assertionTimeout = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assertion_timeout');

	// Only show assertion timeout if assert type is not none
	if (assertValue === '') {
		if (assertionTimeout)
			assertionTimeout.setAttribute('style', 'display:none');
	} else {
		if (assertionTimeout)
			assertionTimeout.setAttribute('style', '');
	}

	var onChangeFunction = assertTypeElement.onchange;
	assertTypeElement.onchange = function() {
		if (onChangeFunction)
			onChangeFunction();

		assertionTimeout = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assertion_timeout');
		if (!assertionTimeout)
			return;

		assertValue = g_form.getValue('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.assert_type');
		// Only show assertion timeout if assert type is not none
		if (assertValue === '')
				assertionTimeout.setAttribute('style', 'display:none');
		else
				assertionTimeout.setAttribute('style', '');
	};
}
