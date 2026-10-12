function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('pa_cubes', 'pa_indicators', 'cube', id);
}

executeDiagnostic(id);
