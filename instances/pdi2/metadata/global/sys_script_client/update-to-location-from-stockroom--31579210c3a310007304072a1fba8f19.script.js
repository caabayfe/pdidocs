function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if (isLoading || newValue == '') {
		return;
	}
	g_form.getReference("to_stockroom", function(stockRmGr) {
		g_form.setValue("to_location", stockRmGr.getValue("location"));
	});
	
}
