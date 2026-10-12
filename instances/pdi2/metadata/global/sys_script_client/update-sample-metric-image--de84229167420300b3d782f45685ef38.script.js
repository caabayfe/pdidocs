function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;

	var dialog = new GlideModal('asmt_sample_metric_image', false);
	dialog.setTitle(new GwtMessage().getMessage('Sample Metric Image Preview'));
	dialog.setSize(1000);
	dialog.setPreference('sysparm_type', g_form.getUniqueValue());
	dialog.setPreference('sysparm_sample_metric', newValue);
	dialog.render();
}
