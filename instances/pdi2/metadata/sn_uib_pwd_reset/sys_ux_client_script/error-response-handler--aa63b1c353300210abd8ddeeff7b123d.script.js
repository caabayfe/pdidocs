/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const errorObj = event.payload ? event.payload: {};
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    errorObj.type = pwdResetUtil.uiConstants.CRITICAL;
    api.emit("PWD_RESET_UIB#SHOW_ALERT_FROM_IDENTIFY", {notificationObj: errorObj});
}
