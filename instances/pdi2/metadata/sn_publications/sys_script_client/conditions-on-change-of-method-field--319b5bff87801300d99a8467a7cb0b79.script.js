function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	CustomEvent.fire("recipient_list.method.changed", newValue);
	if (newValue == 'upload') {
		g_form.setValue('enable_script',false);
	}
}
