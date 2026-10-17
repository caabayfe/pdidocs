function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('pa_indicators', 'pa_job_indicators', 'indicator', id, 'type=1');
}

executeDiagnostic(id);
