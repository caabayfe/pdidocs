function executeDiagnostic(id) {
 	var result = [];
	var util = new PADiagnosticsUtil();
	var tabs = new GlideRecord('pa_tabs');
	if (id)
		tabs.addEncodedQuery('sys_idIN' + id);
	tabs.query();
	while (tabs.next()) {
		var page = tabs.getValue('page');
		if (gs.nil(page) || !util.isValidReference('sys_portal_page', page)) {
			result.push(tabs.getValue('sys_id'));
		}
	}
	return result.join(',');
 }
 
 executeDiagnostic(id);
