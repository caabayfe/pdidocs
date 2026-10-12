function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('sys_ui_hp_publisher', 'sys_ui_hp_cascading_filter', 'publisher_reference', id, 'type=6');
}

executeDiagnostic(id);
