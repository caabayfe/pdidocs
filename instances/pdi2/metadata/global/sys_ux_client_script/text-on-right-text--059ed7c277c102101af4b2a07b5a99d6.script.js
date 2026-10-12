/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.outputValue != null) {
        var responseJSON = JSON.parse(api.context.props.outputValue);
        var status = responseJSON.status;
        var itemName = api.context.props.catalogItemName ? api.context.props.catalogItemName : helpers.translateSync("Catalog Item");

        if (status == "SUCCESS")
            return helpers.translateSync("Submitted: {0}", itemName);
        else if (status == "CANCELED")
            return helpers.translateSync("Canceled: {0}", itemName);
        else
            return helpers.translateSync("Error: {0}", itemName);
    }
    return "";
}
