/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     api.data.get_maturity_level_element_id_1.refresh({
       element_name : api.state.maturityLevelElement});
}
