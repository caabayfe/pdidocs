function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('sys_ui_hp_publisher', 'sys_ui_hp_date', 'publisher_reference', id, 'type=3');
 }
 
 executeDiagnostic(id);
