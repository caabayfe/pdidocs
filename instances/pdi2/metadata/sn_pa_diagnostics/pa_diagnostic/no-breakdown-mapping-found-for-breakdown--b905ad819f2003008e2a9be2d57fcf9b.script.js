function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('pa_breakdowns', 'pa_breakdown_mappings', 'breakdown', id, 'type=1');
}

executeDiagnostic(id);
