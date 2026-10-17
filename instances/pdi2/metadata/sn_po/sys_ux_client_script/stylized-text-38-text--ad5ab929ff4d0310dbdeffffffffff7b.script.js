/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
   const entitlementNumbers = api.state.projectData.miningSummary?.errorContext?.entitlementNumbers;
   if (!entitlementNumbers) return '';

	const withinLabel = entitlementNumbers.cropOrTransitionConditionSet
		? helpers.translateSync('Entitlement 5x - {0}', entitlementNumbers.recordsWithinEntitlement)
		: helpers.translateSync('Records within entitlement - {0}', entitlementNumbers.recordsWithinEntitlement);

	return withinLabel;

}
