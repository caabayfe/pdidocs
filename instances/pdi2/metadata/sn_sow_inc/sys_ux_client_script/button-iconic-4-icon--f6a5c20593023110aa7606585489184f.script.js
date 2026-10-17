/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value.eventSource == "USER_GENERATED" && api.item.value.isDeleted) {
        return 'eye_outline';
    } else {
        return 'eye_slash_outline';
    }
}
