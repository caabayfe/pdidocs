/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.nowAssistVA.isGuidedSetupTurnedOn)
        return api.data.ci_landing_page_data.output.guided_setup_turned_on_button;
    else
        return api.data.ci_landing_page_data.output.guided_setup_turned_off_button;
}
