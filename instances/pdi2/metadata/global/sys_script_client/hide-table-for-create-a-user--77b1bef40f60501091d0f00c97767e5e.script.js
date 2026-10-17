function onLoad() {
	var createAUserStepConfig = 'd9bc5f21ff6033008d3f5d9ad53bf12d';
	var stepConfig = g_form.getValue('step_config');

	if (!stepConfig || stepConfig !== createAUserStepConfig)
		return;

	var tableElement = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.table');
	if (!tableElement)
		return;

	tableElement.setAttribute('style', 'display:none');
}
