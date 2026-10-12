/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const response = api.data.get_mid_server_role_active_users;

    // Change: response.users -> response.output.users
    if (!response || !response.output || !response.output.users || response.output.users.length === 0) {
        api.setState('midserverUsers', []);
        return;
    }

    // Change: response.users -> response.output.users
    var users = response.output.users.map(function(user) {
        return {
            id: user.sys_id,
            label: user.user_name
        };
    });

    api.setState('midserverUsers', users);
}
