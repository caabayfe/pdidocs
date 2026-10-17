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
    const messageHeader = event.payload.header;
    const messageInfo = event.payload.info;
    const messageType = event.payload.type;
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    pwdResetUtil.showAlert(api, messageHeader, messageInfo, messageType);
}
