/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const errorContext = api.state.projectData.miningSummary?.errorContext;
  if (!errorContext) return false;
  const entitlementNumbers = errorContext.entitlementNumbers;
  // Pre-start the usage numbers look healthy (usedRecords is 0, so no overage), which would leave
  // Confirm enabled for a full mine the server has already refused. contractNotStarted has to gate
  // the button explicitly (DEF0871913).
  // The server blocks exhausted base credits before the crop/transition 5x size check, so the
  // no-credits state is driven by the base entitlement, not the 5x ceiling.
  const hasEntitlementIssue = Boolean(errorContext.contractNotStarted)
    || entitlementNumbers?.baseUsageAvailable <= 0
    || Boolean(entitlementNumbers?.hasOverage);
  return hasEntitlementIssue && !api.state.entitlementResolutionSelected;
}
