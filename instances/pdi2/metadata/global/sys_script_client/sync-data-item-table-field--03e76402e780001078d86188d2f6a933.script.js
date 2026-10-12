function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	g_form.getReference("data_item", function(dataItemGR) {
		g_form.setValue("table", dataItemGR.getValue("table"));
	});

}
