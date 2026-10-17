function onLoad() {
	var openNewFormStepConfig = "05317cd10b10220050192f15d6673af8";
	var openExistingRecordStepConfig = "5f2e0e535332120028bc29cac2dc34d3";
	var stepConfig = g_form.getValue("step_config");

	if (!stepConfig || stepConfig !== openNewFormStepConfig && stepConfig !== openExistingRecordStepConfig)
		return;

	var formUIInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".form_ui";
	var viewInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".view";
	var viewMsg = new GwtMessage().getMessage("The View field refers to the name of the view in the UI views table, not its title. If this field is left blank, the default view of the form will load.");

	function checkFormUI() {
		var formUIValue = g_form.getValue(formUIInputName);

		if (!gel(formUIInputName))
			return;

		var viewElement = gel("element." + viewInputName);
		if (!viewElement)
			return;

		if (formUIValue === "" || formUIValue === "standard_ui") {
			viewElement.setAttribute('style', '');
			g_form.showFieldMsg(viewInputName, viewMsg, "info");
		} else {
			g_form.hideFieldMsg(viewInputName, viewMsg, "info");
			viewElement.setAttribute('style', 'display:none');
		}
	}

	var formUIOnChangeEvent = new GlideEventHandler('onChange_' + formUIInputName, checkFormUI, formUIInputName);
	g_event_handlers.push(formUIOnChangeEvent);
}
