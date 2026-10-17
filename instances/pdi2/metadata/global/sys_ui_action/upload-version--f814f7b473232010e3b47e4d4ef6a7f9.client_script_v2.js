function onClick(g_form) {
	var documentSysId = g_form.getUniqueValue();
	g_aw.openRecord('ds_document_version', '-1', {'query': 'document='+documentSysId});
}
