/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const response = api.data.get_mid_server_role_active_users;

if (!response || !response.output || !response.output.users || !Array.isArray(response.output.users) || response.output.users.length === 0) {
    api.setState('midServerUsers', []);
    return;
}

var users = response.output.users
    .filter(function(user) {
        return user && user.sys_id && user.user_name;
    })
    .map(function(user) {
        return {
            id: user.sys_id,
            label: user.user_name
        };
    });

api.setState('midServerUsers', users);
}
