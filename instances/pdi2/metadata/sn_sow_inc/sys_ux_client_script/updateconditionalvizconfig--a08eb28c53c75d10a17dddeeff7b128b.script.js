/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const landingPageUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
    const conditionalVizConfig = await landingPageUtils.getConditionalVisualizationConfig(helpers);
    api.setState("conditionalVizConfig", conditionalVizConfig);
}
