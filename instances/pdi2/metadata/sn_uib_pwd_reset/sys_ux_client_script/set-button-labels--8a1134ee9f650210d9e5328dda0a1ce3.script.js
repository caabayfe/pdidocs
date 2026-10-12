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
    // set next/continue to reset button label 
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    const label = await pwdResetUtil.getVerifyTransistionButtonLabel(api.context.props.isLastVerification, helpers);
    api.setState("nextButtonState", {
        "label": label
    });
    
    //set send verification code label
    const sendEmailCodeButtonState = { ...api.state.sendEmailCodeButtonState
    };
    sendEmailCodeButtonState.label = await helpers.translate("Send verification code");
    api.setState("sendEmailCodeButtonState", sendEmailCodeButtonState);

}
