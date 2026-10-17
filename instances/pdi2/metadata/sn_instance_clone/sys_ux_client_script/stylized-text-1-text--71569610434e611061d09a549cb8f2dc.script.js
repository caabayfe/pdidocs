/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    //Show Clone request number.if change_number is not present or N/A length is less than 5 
    return api.item.value.cells.change_number.value.length > 5 ? api.item.value.cells.change_number.value :
        api.item.value.cells.request_id.value;
}
