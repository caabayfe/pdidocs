/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const usedCredits = api.state.projectData.miningSummary?.errorContext?.entitlementNumbers?.usedCredits;
	if (usedCredits == null) return '';
	return helpers.translateSync('Used credits - {0}', usedCredits);
}
