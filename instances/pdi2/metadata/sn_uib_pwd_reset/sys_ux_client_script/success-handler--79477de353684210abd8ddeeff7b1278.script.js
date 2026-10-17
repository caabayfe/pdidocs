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
    const dataBrokerId = event.elementId;
    switch (dataBrokerId) {
        case "look_up_multiple_records":
            const users = api.data.look_up_multiple_records.results;
            const userList = users ? getUserList(users): [];
            api.emit("PWD_RESET_UIB#UPDATE_USER_FIELD", userList);
            break;
        case "get_pwd_reset_sdesk_processes":
            const processes = api.data.get_pwd_reset_sdesk_processes.output;
            const processList = processes ? getProcessList(processes): [];
            api.emit("PWD_RESET_UIB#UPDATE_PWD_PROCESS_FIELD", processList);
            break;
    }

    function getUserList(users) {
        const userFieldArray = [];
        users.forEach(user => {
            const avatarUrl = "/" + user.avatar.displayValue + "?t=small";
            const userName = user.name.displayValue;
            const userId = user.user_name.displayValue;
            const userSysId = user.sys_id.value;
            userFieldArray.push({
                id: userSysId,
                label: userName,
                sublabel: userId,
                avatarProps: {
                    userName: userName,
                    imageSrc: avatarUrl
                }
            });
        });
        return userFieldArray;
    }

    function getProcessList(processes) {
        const pwdProcessFieldArray = [];
        processes.forEach(process => {
            pwdProcessFieldArray.push({
                id: process.procSysId,
                label: process.procName
            });
        });
        return pwdProcessFieldArray;
    }
}
