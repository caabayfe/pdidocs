/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const errorContext = api.state.projectData?.miningSummary?.errorContext;
    // Checked first: the block is date-based, so the usage numbers the other branches quote are
    // meaningless before the contract starts — pre-start `usedRecords` is 0, so a project that fits
    // would otherwise fall through to "exceeds your entitlement by 0 records" (DEF0871913).
    if (errorContext?.contractNotStarted) {
        return {
            label: helpers.translateSync("Process Mining isn't available yet because your contract hasn't started. Contact your ServiceNow account representative for more information."),
            size: 'sm',
            lines: 2,
        };
    }
    const entitlementNumbers = errorContext?.entitlementNumbers;
    if (!entitlementNumbers) {
        return { label: '', size: 'sm', lines: 2 };
    }
    let label = '';
    // The server blocks exhausted base credits before the crop/transition 5x size check, so the
    // no-credits caption must take precedence over the 5x transition caption.
    if (entitlementNumbers.baseUsageAvailable <= 0) {
        label = helpers.translateSync('There are no current credits available. All your entitlement credits have been used.');
    } else if (entitlementNumbers?.cropOrTransitionConditionSet) {
        label = helpers.translateSync('This project uses a transition configuration. To ensure accurate credit consumption, the maximum scope is limited to 5x your entitlement.');
    } else {
        label = helpers.translateSync('Your current project scope exceeds your entitlement by {0} records.', entitlementNumbers?.recordsExceedingEntitlement);
    }

    return {
        label: label,
        size: 'sm',
        lines: 2,
    };
}
