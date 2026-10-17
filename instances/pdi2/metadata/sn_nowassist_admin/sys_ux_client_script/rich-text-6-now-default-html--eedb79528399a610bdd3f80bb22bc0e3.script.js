/**
 * @param {Object} params
 * @param {Object} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const approvedProviders = api?.state?.aictApprovedProviders ?? [];
    const providerLabels = approvedProviders.map(({ label }) => label).join(", ");
    return helpers.translateSync(
        `<p>Note: The approved model providers are <b>{0}</b>. You can update the current model providers for <b>skill groups and skills.</b></p>`,
        providerLabels
    );
}
