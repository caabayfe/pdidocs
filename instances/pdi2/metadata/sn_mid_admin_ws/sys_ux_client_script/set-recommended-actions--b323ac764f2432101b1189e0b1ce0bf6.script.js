/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var rec_action_list = [];
    var version = api.data.mid_server_look_up_a_single_record.result.version.value;
    var version_status = api.data.get_mid_server_details.output.version.status;
    if (version_status === 'incompatible') {
        var new_list_item = {};
        new_list_item.message = 'Reported MID Server version ' + version + ' is not compatible with instance version. Upgrade is recommended.';
        new_list_item.action = 'Upgrade';
        new_list_item.priority = 'High';
        new_list_item.color = 'critical';
        rec_action_list.push(new_list_item);
    }
    api.setState('recommendedActions', rec_action_list);
}
