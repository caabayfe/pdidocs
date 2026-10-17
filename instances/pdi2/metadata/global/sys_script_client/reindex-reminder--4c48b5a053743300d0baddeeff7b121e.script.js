function onSubmit() {
	var attribute = g_form.getReference('name');
	var configuration = g_form.getReference('ts_configuration');
	if (attribute.needs_reindex == 'true' || (attribute.name == 'ts_weight' && configuration.applies_to == '0' && configuration.format == 'v3'))
		alert(new GwtMessage().getMessage('Re-index {0} is needed to apply the {1} change', configuration.table, attribute.label));
}
