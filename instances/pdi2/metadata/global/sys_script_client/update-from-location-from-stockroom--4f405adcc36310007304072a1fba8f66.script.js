function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if (isLoading || newValue == '') {
		return;
	}
	
	g_form.getReference("from_stockroom", function(stockRmGr) {
		g_form.setValue("from_location", stockRmGr.getValue("location"));
	});

}
