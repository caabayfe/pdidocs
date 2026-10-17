/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var dispVal = api.state.selectedFieldDisplayVal;
    api.state.fieldTypeahead.hasError = api.state.selectedField === null && dispVal !== null && dispVal.trim().length > 0;
    return api.state.fieldTypeahead.hasError;
}
