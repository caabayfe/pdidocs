/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const errorContext = api.state.projectData.miningSummary?.errorContext;
	if (!errorContext?.entitlementNumbers) return true;
	// Hide the adjust-scope card when base credits are exhausted, or when the contract hasn't started —
	// pre-start no scope is small enough to unblock the mine, so the card offers a dead end. Sample
	// mine stays available (the guardrail skips previews), so Confirm can still be satisfied
	// (DEF0871913).
	return errorContext.entitlementNumbers.baseUsageAvailable <= 0 || Boolean(errorContext.contractNotStarted);
}
