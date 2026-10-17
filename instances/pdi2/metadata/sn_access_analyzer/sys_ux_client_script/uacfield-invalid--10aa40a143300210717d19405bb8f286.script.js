/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    let dispVal = api.state.compareAccessTab.uacField.typedValue;
    api.state.compareAccessTab.uacField.hasError = api.state.compareAccessTab.uacField.selectedId === null &
        dispVal !== null && dispVal.trim().length > 0;

    return api.state.compareAccessTab.uacField.hasError;
}
