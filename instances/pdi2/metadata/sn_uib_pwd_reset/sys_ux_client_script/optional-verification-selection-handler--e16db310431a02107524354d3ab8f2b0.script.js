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
    if (!event.payload || event.payload.index == null || event.payload.isChecked == null)
        return;
    api.emit("PWD_RESET_UIB#CLEAR_ALERT_NOTIFICATION_FOR_VERIFICATION");
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    let verificationDetails = [...api.state.verificationDetails];
    verificationDetails[event.payload.index].isChecked = event.payload.isChecked;
    api.setState("questionAnswerDetails", verificationDetails);
    let checkedVerificationsCount = 0;
    for (let i = 0; i < verificationDetails.length; i++) {
        if (verificationDetails[i].isChecked) {
            checkedVerificationsCount++;
        }
    }

    const minimumSelection = api.state.minimumSelection;
    if (checkedVerificationsCount === minimumSelection)
        api.setState("isContinueButtonEnabled", true);
    else if (checkedVerificationsCount < minimumSelection)
        api.setState("isContinueButtonEnabled", false);
    else {
        api.setState("isContinueButtonEnabled", false);
        const errorObj = {
            "info": await pwdResetUtil.getTranslation(helpers, "Number of selected methods can't be more than {0}. Deselect excess method(s) to proceed.", [minimumSelection]),
            "type": pwdResetUtil.uiConstants.CRITICAL
        };
        api.emit("PWD_RESET_UIB#SHOW_VERIFICATION_PAGE_ALERT", {
            notificationObj: errorObj
        });
    }
}
