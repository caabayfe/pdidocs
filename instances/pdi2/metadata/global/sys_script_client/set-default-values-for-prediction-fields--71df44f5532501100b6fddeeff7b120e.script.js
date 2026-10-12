function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	// Update the default values for the Prediction fields column to Short description and Description
	g_form.setValue("prediction_fields", "short_description,description");
}
