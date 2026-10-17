function onLoad() {
	var stepConfigId = g_form.getValue('step_config');
	if (stepConfigId !== '22aed143dfe0220062fe6c7a4df2639d') // Click Modal button
		return;

	var inputVarPrfx = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfigId;
	var formUIInputVar = inputVarPrfx + '.form_ui';
	var uiPageInputVar = inputVarPrfx + '.ui_page';
	var buttonInputVar = inputVarPrfx + '.button';
	var modalActionInputVar = inputVarPrfx + '.modal_action';
	var modalValuesInputVar = inputVarPrfx + '.modal_values';
	var standardUIVars = [uiPageInputVar, buttonInputVar];
	var workspaceVars = [modalActionInputVar, modalValuesInputVar];

	function formUIOnchange(control, oldVal, newVal, loading, template) {
		if (!newVal || newVal === 'standard_ui') {
			// hide workspace vars and show standard UI vars
			toggleInputVarVisibility(standardUIVars, true);
			toggleInputVarVisibility(workspaceVars, false);
			g_form.setMandatory('ui_page', true);
			g_form.setMandatory('button', true);
		} else {
			// show workspace vars and hide standard UI vars
			g_form.setMandatory('ui_page', false);
			g_form.setMandatory('button', false);
			toggleInputVarVisibility(workspaceVars, true);
			toggleInputVarVisibility(standardUIVars, false);
		}
	}

	function toggleInputVarVisibility(inputVarIdArr, shouldShow) {
		for (var i = 0; i < inputVarIdArr.length; i += 1) {
			var inputVar = inputVarIdArr[i];
			var inputVarContainerElem = gel('element.' + inputVar);
			if (!inputVarContainerElem)
				continue;

			if (shouldShow)
				inputVarContainerElem.style.display = '';
			else
				inputVarContainerElem.style.display = 'none';
		}
	}

	g_event_handlers.push(new GlideEventHandler('onChange_' + formUIInputVar, formUIOnchange, formUIInputVar));

}
