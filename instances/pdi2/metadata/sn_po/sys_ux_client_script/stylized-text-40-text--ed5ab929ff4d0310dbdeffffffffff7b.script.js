/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
   const entitlementNumbers = api.state.projectData.miningSummary?.errorContext?.entitlementNumbers;
   if (!entitlementNumbers) return '';

	const exceedingLabel = entitlementNumbers.cropOrTransitionConditionSet
		? helpers.translateSync('Records that exceed (entitlement x5) - {0}', entitlementNumbers.recordsExceedingEntitlement)
		: helpers.translateSync('Records that exceed entitlement - {0}', entitlementNumbers.recordsExceedingEntitlement);

	return exceedingLabel;
}
