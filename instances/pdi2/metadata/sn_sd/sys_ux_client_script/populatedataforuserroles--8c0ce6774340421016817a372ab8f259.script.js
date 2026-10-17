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
    function populateUsersList(userList) {
        var usersList = {};
        usersList.rows = [];
        for (var i = 0; i < userList.length; i++) {
            usersList.rows[i] = {};
            usersList.rows[i].metadata = {
                "sysId": userList[i].id,
                "isInherited": userList[i].inherited,
                "recordClassName": "sys_user_has_role",
            };
            usersList.rows[i].cells = {};
            usersList.rows[i].key = userList[i].id;
            usersList.rows[i].isSelected = false;
            usersList.rows[i].cells.userName = {
                "value": userList[i].userName
            };
            usersList.rows[i].cells.userId = {
                "value": userList[i].userId
            };
            usersList.rows[i].cells.inherited = {
                "value": userList[i].inherited
            };
            if (userList[i].inherited === 'true')
                usersList.rows[i].selectionDisabled = true;
            else
                usersList.rows[i].selectionDisabled = false;

        }
        return usersList;
    }
    let presentationalListRows = populateUsersList(api.data.fetch_users_having_selected_role.output);
    api.setState('usersList', api.data.fetch_users_having_selected_role.output);
    api.setState('rowsData', presentationalListRows);
    api.setState('selectedRowsCount', 0);
}
