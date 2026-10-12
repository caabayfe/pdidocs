/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // When a user upgrades from earlier versions to version Y or later, the enforceViewRulesForQuickForm input value will be missing in the macroponent definition of existing RLB/Template pages.
    // Consequently, the value will be undefined, even though the property appears as enabled in UI Builder.
    if (api.data.controller.inputs.enforceViewRulesForQuickForm !== undefined && !api.data.controller.inputs.enforceViewRulesForQuickForm) {
        return api.data.controller.current.formViewName;
    }
    return "";
}
