/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var output = api.data.get_dropdown_items_for_select_users.output; 
    api.setState('dropDownValues', output); 
}
