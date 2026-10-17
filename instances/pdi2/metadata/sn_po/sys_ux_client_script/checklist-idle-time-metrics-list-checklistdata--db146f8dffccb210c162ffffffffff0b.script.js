/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.idleTimeConfiguration.fields.map((field) => ({
        itemId: field.name,
        label: field.label,
        checked: field.checked
    }));
}
