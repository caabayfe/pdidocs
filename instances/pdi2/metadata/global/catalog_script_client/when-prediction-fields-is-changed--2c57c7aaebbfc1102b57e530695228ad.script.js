function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading)
        return;
    if (!newValue) {
        g_form.setMandatory("prediction_fields_dummy", true);
		    g_form.setValue("is_prediction_fields_empty", true);
    } else {
        g_form.setMandatory("prediction_fields_dummy", false);
		    g_form.setValue("is_prediction_fields_empty", false);
    }
}
