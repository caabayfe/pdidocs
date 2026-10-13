/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let label = "";
    if (api.item.value && api.item.value.name)
        label = helpers.translateSync("Actions for {0}", api.item.value.name);
    return label;
}
