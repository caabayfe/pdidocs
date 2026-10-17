/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const errorContext = api.state.projectData.miningSummary?.errorContext;
	if (!errorContext?.entitlementNumbers) return true;
	// Hide the credits summary when base credits are exhausted, or when the contract hasn't started
	// (the usage numbers are meaningless pre-start) — DEF0871913.
	return errorContext.entitlementNumbers.baseUsageAvailable <= 0 || Boolean(errorContext.contractNotStarted);
}
