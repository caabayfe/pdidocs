/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value.isValidUser) {
        return api.item.value.name;
    } else {
        return api.item.value.contactDetails;
    }
}
