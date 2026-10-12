function onLoad() {
   //Type appropriate comment here, and begin script below
   var openExistingRecordStep = "5f2e0e535332120028bc29cac2dc34d3";
   var stepConfig = g_form.getValue("step_config");

   if (!stepConfig || stepConfig !== openExistingRecordStep)
		return;

	var formUIInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".form_ui";
	var selectedTabIndexInputName = "sys_atf_step.inputs.var__m_atf_input_variable_" + stepConfig + ".selected_tab_index";

	function checkFormUI() {
		var formUI = g_form.getValue(formUIInputName);
		var selectedTabIndexElement = gel("element." + selectedTabIndexInputName);

		if (!selectedTabIndexElement)
			return;

		if (formUI == "standard_ui")
			selectedTabIndexElement.setAttribute('style', 'display: none;');
		else
			selectedTabIndexElement.setAttribute('style', '');
	}

	var formUIOnChangeEvent = new GlideEventHandler('onChange_' + formUIInputName, checkFormUI, formUIInputName);
	g_event_handlers.push(formUIOnChangeEvent);
}
