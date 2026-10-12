/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var param = api.state.hermesServiceScriptableParam ; 
    var selectedService = api.state.selectedTestHermesService.id;
    if( param != selectedService){
        api.setState("hermesServiceScriptableParam", api.state.selectedTestHermesService.id);
    } else {
        api.data.hermesteststatus.refresh();
    }
}
