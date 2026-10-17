function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var preChangeValue = g_scratchpad.interaction !== undefined ? g_scratchpad.interaction : oldValue;

	if (isLoading || preChangeValue == newValue) {
		return;
	}

	if (newValue == '') {
		g_scratchpad.interaction = newValue;
		g_form.setValue("interaction_input_map", "");
		return;
	}

	var ga = new GlideAjax('RecordFieldGetter');
	ga.addParam('sysparm_name','getValue');
	ga.addParam('sysparm_table','sys_ui_interaction');
	ga.addParam('sysparm_sys_id', newValue);
	ga.addParam('sysparm_field_name', 'inputs');
	ga.getXMLAnswer(function(response) {
		var inputs = [];
		try {
			inputs = JSON.parse(response || '[]');
		} catch (e) {
			g_form.addErrorMessage(formatMessage(getMessage("Unable to parse JSON for 'Inputs': {0}"), e));
			return;
		}

		if (!inputs.length) {
			g_scratchpad.interaction = newValue;
			g_form.setValue("interaction_input_map", "{}");
			return;
		}

		var d = new GlideModal('sn_ui_interaction_configure_ui_interaction_inputs', true);
		d.setTitle(getMessage("Configure inputs"));
		d.setPreference('sysparm_prev_interaction', preChangeValue);
		d.setPreference('sysparm_interaction', newValue);
		d.setPreference('sysparm_interaction_input_map', g_form.getValue("interaction_input_map"));
		d.setPreference('focusTrap', true);
		d.render();
	});	
}
