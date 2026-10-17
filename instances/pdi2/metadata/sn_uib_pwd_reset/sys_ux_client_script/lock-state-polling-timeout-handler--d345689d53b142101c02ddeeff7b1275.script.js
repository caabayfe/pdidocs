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
    let pageDetails = {...api.state.pageDetails};
    pageDetails.lockStateDetail = await pwdResetUtil.getLockStateDetail(pwdResetUtil.uiConstants.UNABLE_RETRIEVING_LOCK_STATE, helpers);
    api.setState("pageDetails", pageDetails);
}
