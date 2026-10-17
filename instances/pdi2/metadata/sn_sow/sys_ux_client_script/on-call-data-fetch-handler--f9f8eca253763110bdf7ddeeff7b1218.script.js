/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('onCallData', api.data.oncall_groups_by_id_1.output);
    api.data.sow_team_mgmt_data_broker.refresh();
}
