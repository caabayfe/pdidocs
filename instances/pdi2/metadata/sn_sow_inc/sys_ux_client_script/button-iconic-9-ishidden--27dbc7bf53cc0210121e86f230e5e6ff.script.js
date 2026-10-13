/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value.eventType == "CUSTOM_EVENT" && api.data.look_up_pir_state.results[0].state.value != "published" && api.state.accessPermission.canAddTimelineEvent) {
        return false;
    } else {
        return true;
    }
}
