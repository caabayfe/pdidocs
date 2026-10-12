/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const landingPageUtils = imports['sn_sow_itsm_common.SOWLandingPageTier2Utils']();
    const conditionalVizConfig = await landingPageUtils.getConditionalVisualizationConfig(helpers);
    api.setState("conditionalVizConfig", conditionalVizConfig);
}
