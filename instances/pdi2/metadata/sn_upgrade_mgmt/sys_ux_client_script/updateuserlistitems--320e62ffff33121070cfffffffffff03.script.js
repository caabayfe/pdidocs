/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const response = api.data.get_users_list_to_assign.results || [];
    const userList = [];

    for (let obj of response) {
        userList.push({
            'id': obj.sys_id.value,
            'label': obj.name.displayValue
        });
    }
    api.setState('userListItems', userList);
}
