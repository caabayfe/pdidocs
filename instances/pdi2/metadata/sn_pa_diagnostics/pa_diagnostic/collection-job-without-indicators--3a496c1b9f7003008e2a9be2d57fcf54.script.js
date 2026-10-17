function executeDiagnostic(id) {
	return new PADiagnosticsUtil().checkMissingRelatedList('sysauto_pa', 'pa_job_indicators', 'job', id);
}

executeDiagnostic(id);
