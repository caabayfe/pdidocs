function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === 'false')
		return;

	g_form.addInfoMessage(getMessage('Allow search request with an empty search term to be sent back to server. In case of "Table" search resource, it will return all records from result table. In case of "Script" search resource, script writer is responsible to handle the empty search term.'));
}
