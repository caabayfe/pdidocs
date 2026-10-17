function openDiagnosticsPage() {
	var baseUrl = '/related_list_diagnostics.do?sysparm_relationship_id=' + g_form.getUniqueValue();
	g_navigation.open(baseUrl, '_blank');
}
