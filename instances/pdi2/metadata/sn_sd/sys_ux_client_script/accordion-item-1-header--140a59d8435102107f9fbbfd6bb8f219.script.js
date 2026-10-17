/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let header = {
        label: api.item.value.question,
        variant: "secondary",
        size: "md",
    };

    return header;
}
