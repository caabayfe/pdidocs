/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const selectedComponent = api.state.selectedComponent.macroponentSysId;
    const selectedController = api.state.selectedController.id;
    if(selectedComponent) {
        api.setState('invalidComponent', false);
    }
    if(selectedController) {
        api.setState('invalidController', false);
    }
    if(selectedComponent && selectedController) {
        api.data.look_up_preset_records.refresh();
    }
}
