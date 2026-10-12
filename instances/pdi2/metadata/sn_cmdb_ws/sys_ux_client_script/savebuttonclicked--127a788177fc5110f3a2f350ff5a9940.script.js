/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Display Save Options
    let panelsHidden = api.state.panelsHidden;
    panelsHidden.saveOptions = false;
    api.setState('panelsHidden',panelsHidden);
    // Hide Save button / show Save go to dashboard button
    api.setState('saveGoToDashboardButtonHidden', false);
    api.setState('saveAndRunButtonHidden', false);
    api.setState('saveButtonHidden',true);  
}
