function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
		toggleFields();
        return;
    }

	toggleFields();

    function toggleFields() {
        var sourceType = g_form.getValue('source_type');
		var isScriptable = sourceType === 'javascript';

		g_form.setDisplay('request_provider_class_name', !isScriptable);
		g_form.setDisplay('data_provider_class_name', !isScriptable);
		g_form.setDisplay('request_bucket_provider_class_name', !isScriptable);
		g_form.setDisplay('analytics_configuration_provider', !isScriptable);
		g_form.setSectionDisplay("request_provider", isScriptable);
		g_form.setSectionDisplay("data_provider", isScriptable);
		g_form.setSectionDisplay("request_bucketprovider", isScriptable);
		g_form.setSectionDisplay("configuration_provider", isScriptable);
    }

}
