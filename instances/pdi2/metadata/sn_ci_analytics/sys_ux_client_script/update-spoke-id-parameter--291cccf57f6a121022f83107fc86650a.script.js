/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
var chosenValue = event.payload.appliedFilters[0].values.length > 0 ? event.payload.appliedFilters[0].values[0] : '';
    if (!chosenValue) {
        let {
            spokeId
        } = api.context.props;
        chosenValue = spokeId;
    }
    var params = {
        spokeId: chosenValue
    };
    helpers.navigate.setRouteParams({
        params
    });
}
