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
    const eventName = event.name;
    switch (eventName) {
        case "PWD_RESET_UIB#GET_USER_DETAILS":
            const userName = event.payload.userName;
            const queryCondition = "nameLIKE" + userName;
            api.setState("userNameQuery", queryCondition);
            break;
        case "PWD_RESET_UIB#GET_PWD_RESET_PROCESS_DETAILS":
            const userSysId = event.payload.userSysId;
            api.setState("selectedUserId", userSysId);
            break;
    }
}
