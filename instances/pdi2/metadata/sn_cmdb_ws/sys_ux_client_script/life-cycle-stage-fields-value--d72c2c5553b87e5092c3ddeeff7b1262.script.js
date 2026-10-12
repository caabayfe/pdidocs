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

    return (
        userPayload.attributes[mainTable]?.additionalFields?.[element]?.displayValue ||
        api.item.value?.displayValue ||
        ''
    );
}
