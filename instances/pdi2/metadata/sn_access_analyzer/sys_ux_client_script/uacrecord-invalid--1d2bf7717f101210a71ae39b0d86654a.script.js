/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let dispVal = api.state.compareAccessTab.uacRecord.typedValue;
    api.state.compareAccessTab.uacRecord.hasError = api.state.compareAccessTab.uacRecord.selectedId === null &&
        (dispVal !== null && dispVal.trim().length > 0);

    return api.state.compareAccessTab.uacRecord.hasError;
}
