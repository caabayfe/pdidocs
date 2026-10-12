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
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    api.setState("nextButtonState", {
        "label": await pwdResetUtil.getVerifyTransistionButtonLabel(api.context.props.isLastVerification, helpers)
    });
    const sendSMSCodeButtonState = { ...api.state.sendSMSCodeButtonState
    };
    sendSMSCodeButtonState.label = await helpers.translate("Send verification code");
    api.setState("sendSMSCodeButtonState", sendSMSCodeButtonState);
}
