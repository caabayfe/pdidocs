/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const raHelper = imports['sn_nb_action.RAHelper'](...arguments);
raHelper.handleRAEvents();
}
