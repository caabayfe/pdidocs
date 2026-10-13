function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var elSystemEscTypes = gel('rota_system_escalation_types');
	var elCustEscType = gel('rota_custom_escalation_type');
	var showCustomEscalationLink = gel('show_custom_escalation');
	if (g_form.getValue('use_custom_escalation') === 'true') {
		if (elSystemEscTypes)
			elSystemEscTypes.hide();
		if (elCustEscType)
			elCustEscType.show();
		if (showCustomEscalationLink)
			showCustomEscalationLink.show();
		g_form.setVisible('catch_all', false);
	} else {
		if (elSystemEscTypes)
			elSystemEscTypes.show();
		if (elCustEscType)
			elCustEscType.hide();
		if (showCustomEscalationLink)
			showCustomEscalationLink.hide();
		g_form.setVisible('catch_all', true);
	}
}
