function onClick(g_form) {
	g_aw.openRecord("incident_task", "-1", { query: "incident=" + g_form.getUniqueValue() });
}
