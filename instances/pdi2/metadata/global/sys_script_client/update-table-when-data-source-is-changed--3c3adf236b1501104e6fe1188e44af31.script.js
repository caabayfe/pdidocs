function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	if(newValue != "" && g_form.isNewRecord())
		g_form.getReference('report_source', updateTable);
}

function updateTable(reportSource) {
    g_form.setValue("table", reportSource.table);
}
