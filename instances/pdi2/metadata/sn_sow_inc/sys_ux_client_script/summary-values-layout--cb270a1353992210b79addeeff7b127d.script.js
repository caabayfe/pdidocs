/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.initialSectionLoad.summary ? null : (api.state.sectionConfig.summary.formSections && api.state.sectionConfig.summary.formSections[0] && api.state.sectionConfig.summary.formSections[0].rows || []);
}
