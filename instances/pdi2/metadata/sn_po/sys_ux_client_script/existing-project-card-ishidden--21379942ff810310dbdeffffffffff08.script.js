/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const errorContext = api.state.projectData.miningSummary?.errorContext;
	if (!errorContext?.entitlementNumbers) return true;
	// Show the existing-project card when base credits are exhausted, or when the contract hasn't
	// started — both are "no usage window" states where opening a previously mined version is the
	// only way to see results (DEF0871913).
	return !(errorContext.entitlementNumbers.baseUsageAvailable <= 0 || Boolean(errorContext.contractNotStarted));
}
