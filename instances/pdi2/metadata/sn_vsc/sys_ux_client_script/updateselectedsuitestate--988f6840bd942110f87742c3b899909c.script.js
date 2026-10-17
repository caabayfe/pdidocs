/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var arrayVal = "";
    var stringItems = JSON.stringify(event.payload.items);
    var arrayValue = JSON.parse(stringItems);
    api.setState("selectedSuite", api.state.selectedSuite);
    
    if (arrayValue.length > 0) {
        arrayVal = arrayValue[arrayValue.length - 1];
        api.setState("selectedSuite", arrayVal.id.toString());
    }
}
