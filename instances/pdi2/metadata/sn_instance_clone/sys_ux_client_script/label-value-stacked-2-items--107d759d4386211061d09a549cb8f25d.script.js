/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var target_instance = api.item.value.cells.target_instance.label;
    var data = [{
        "label": "Target Instance",
        "value": {
            "type": "string",
            "value": target_instance
        }
    }];
    return data;

}
