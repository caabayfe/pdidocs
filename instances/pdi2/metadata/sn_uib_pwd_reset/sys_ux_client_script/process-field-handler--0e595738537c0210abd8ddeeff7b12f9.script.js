/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const processList = event.payload ? event.payload : [];
    const selectedUser = api.state.selectedUserID;
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    if (processList.length !== 0 || !selectedUser) {
        setPWDProcesFieldValidationMessages(true);
    } else {
        setPWDProcesFieldValidationMessages(false);
        api.emit("PWD_RESET_UIB#SHOW_ALERT_FROM_IDENTIFY", {notificationObj: {
            header: await pwdResetUtil.getTranslation(helpers, "No password reset process found for the user!"),
            info: await pwdResetUtil.getTranslation(helpers, "Contact your system administrator to get a process assigned to this user."),
            type: pwdResetUtil.uiConstants.CRITICAL
        }});
    }
    api.setState("pwdProcessDetails", processList);

    async function setPWDProcesFieldValidationMessages(isValid) {
        let alertMessages = [];
        if (!isValid) {
            alertMessages.push({
            "status": pwdResetUtil.uiConstants.CRITICAL,
            "icon": pwdResetUtil.uiConstants.INFO_ICON,
            "content": await pwdResetUtil.getTranslation(helpers, "No service-desk processes found for the selected user.")
            });
        }
        api.setState("isPwdProcessFieldValid", isValid);
        api.setState("pwdProcessFieldAlertMessages", alertMessages);
    }
}
