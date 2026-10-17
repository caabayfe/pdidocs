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
    // Contract hasn't started (future start/anniversary): the usage numbers are meaningless, so show
    // a not-started message instead of the "reduce scope to {0}" guidance (DEF0871913).
    if (errorContext?.contractNotStarted) {
        return {
            label: helpers.translateSync("Process Mining isn't available yet because your contract hasn't started. Contact your ServiceNow account representative for more information."),
            size: 'sm',
        };
    }
    return {
        label: helpers.translateSync('Reduce scope to bring the project to up to {0} records. Full mining will then be available.', errorContext?.entitlementNumbers?.recordsWithinEntitlement),
        size: 'sm',
    };
}
