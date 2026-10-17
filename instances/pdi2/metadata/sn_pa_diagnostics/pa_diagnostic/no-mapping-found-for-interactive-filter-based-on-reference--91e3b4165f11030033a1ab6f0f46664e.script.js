function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('sys_ui_hp_publisher', 'sys_ui_hp_reference', 'publisher_reference', id, 'type=2');
 }
 
 executeDiagnostic(id);
