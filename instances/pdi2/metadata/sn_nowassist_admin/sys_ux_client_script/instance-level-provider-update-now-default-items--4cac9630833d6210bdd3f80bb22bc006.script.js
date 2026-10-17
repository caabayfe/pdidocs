/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var providers = api.state?.aictApprovedProviders || [];
    providers = providers.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));
    return providers
}
