/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const { userPayload, mainTable } = api.state;
    const element = api.item.value?.element;

    const value =
        userPayload.attributes[mainTable]?.additionalFields?.[element]?.value ||
        api.item.value?.value ||
        '';

    if (typeof value === 'string') {
        return value.trim().length === 0;
    }

    return !value;
}
