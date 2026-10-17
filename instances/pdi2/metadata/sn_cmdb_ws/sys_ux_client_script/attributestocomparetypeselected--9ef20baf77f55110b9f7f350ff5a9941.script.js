/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let query = JSON.parse(JSON.stringify(api.state.query));
    let attributesToCompareType = String(event.payload.value)
    api.setState('attributesToCompareType', attributesToCompareType);
    api.setState('isDirty',true);

    // Fix for Radio buttons
    let attributesToCompareOptions = api.state.attributesToCompareOptions.map((x) => x);
    attributesToCompareOptions.forEach((element) => element.checked = (element.id === attributesToCompareType) ? true : false);
    api.setState('attributesToCompareOptions',attributesToCompareOptions);

}
