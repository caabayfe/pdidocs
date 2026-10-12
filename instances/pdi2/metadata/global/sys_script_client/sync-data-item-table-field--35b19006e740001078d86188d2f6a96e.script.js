function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
       return;
    }
	g_form.getReference("data_item", function(dataItemGR) {
		g_form.setValue("data_item_table", dataItemGR.getValue("table"));
	});
}
