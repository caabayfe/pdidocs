/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Show Clone request number.if change_number is not present or N/A length is less than 5 
    var request_no = api.item.value.cells.change_number.value.length > 5 ? api.item.value.cells.change_number.value : api.item.value.cells.request_id.value;
    var jsonData = {
        "button": {
            "aria-label": (request_no + " Clone Summary Card")
        },
        "group": {
            "aria-disabled": "true"
        }
    };
    return jsonData;
}
