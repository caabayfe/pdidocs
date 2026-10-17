/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

api.setState('selectedComponent',{});
api.setState('presetName',null);
api.setState('selectedController',{});
api.setState('presetDescription',null);
api.setState('existingPresetData',[]);
api.setState('showExistingPresetInit',false);
api.setState('createPresetClicked',false);
api.setState('existingPresetData',[]);
}
