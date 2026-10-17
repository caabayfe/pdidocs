/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    let nextButtonState = {...api.state.nextButtonState};
    nextButtonState.label = await pwdResetUtil.getVerifyTransistionButtonLabel(api.context.props.isLastVerification, helpers);
    api.setState("nextButtonState", nextButtonState);
}
