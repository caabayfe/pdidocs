/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const state = api.data.look_up_pir_state.results[0].state.value;
    if (state == "draft") {
        return helpers.translateSync("Mark Published");
    } else {
        return helpers.translateSync("Unpublish");
    }
}
