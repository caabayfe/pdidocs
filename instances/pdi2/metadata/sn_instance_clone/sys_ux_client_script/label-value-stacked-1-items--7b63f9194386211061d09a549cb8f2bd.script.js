/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var instance_url = api.item.value.cells.source_instance.label || "Current Instance";


    var data = [{
        "label": "Source Instance",
        "value": {
            "type": "string",
            "value": instance_url
        }
    }];

    return data;
}
