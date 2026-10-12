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
    const intervalId = api.state.lockStatePollingIntervalId;
    const result = api.data.get_pwd_reset_user_lock_state.output ? api.data.get_pwd_reset_user_lock_state.output : {};

    if (!result.isValid) {
        helpers.timing.clearInterval(intervalId);
        await pwdResetUtil.errorPageRedirection(result, helpers, api);
        return;
    }

    const currLockState = result.lockState;
    if (currLockState !== pwdResetUtil.uiConstants.RETRIEVING_LOCK_STATE) {
        helpers.timing.clearInterval(intervalId);
        let pageDetails = { ...api.state.pageDetails
        };
        pageDetails.lockStateDetail = await pwdResetUtil.getLockStateDetail(result.lockState, helpers);
        if (currLockState === pwdResetUtil.uiConstants.USER_ACCOUNT_NOT_LOCKED) {
            pageDetails.isAccountUnlockApplicable = false;
        }
        api.setState("pageDetails", pageDetails);
    }
}
