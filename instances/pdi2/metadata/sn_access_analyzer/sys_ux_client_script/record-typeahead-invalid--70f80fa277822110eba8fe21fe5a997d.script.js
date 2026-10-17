/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var dispVal = api.state.selectedRecordDisplayVal;
    api.state.recordTypeahead.hasError = api.state.selectedRecord === null &&
        (dispVal !== null && dispVal.trim().length > 0);
    return api.state.recordTypeahead.hasError;

}
