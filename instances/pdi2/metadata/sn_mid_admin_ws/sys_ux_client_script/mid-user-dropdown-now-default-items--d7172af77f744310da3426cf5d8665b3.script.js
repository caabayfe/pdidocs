/**
 * @param {params} params
 * @param {api} params.api
 */
function evaluateProperty({
    api
}) {
    var arr = [];
    var response = api.data.get_mid_server_role_active_users;

    if (!response || !response.output || !response.output.users) {
        return arr;
    }

    for (var i = 0; i < response.output.users.length; i++) {
        arr.push({
            id: response.output.users[i].sys_id,
            label: response.output.users[i].name || response.output.users[i].user_name
        });
    }

    return arr;
}
