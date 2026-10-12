function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('sys_ui_hp_publisher', 'sys_ui_hp_group', 'group_publisher', id, 'type=4');
 }
 
 executeDiagnostic(id);
