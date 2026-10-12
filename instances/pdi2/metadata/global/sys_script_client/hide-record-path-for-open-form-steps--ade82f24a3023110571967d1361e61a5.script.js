function onLoad() {
	var openNewFormStepConfig = '05317cd10b10220050192f15d6673af8';
	var openExistingRecordStepConfig = '5f2e0e535332120028bc29cac2dc34d3';
	var stepConfig = g_scratchpad.sys_atf_step_config;

	if (!stepConfig || stepConfig !== openNewFormStepConfig && stepConfig !== openExistingRecordStepConfig)
		return;

	var tableElement = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.record_path');
	if (!tableElement)
		return;

	tableElement.setAttribute('style', 'display:none');
}
