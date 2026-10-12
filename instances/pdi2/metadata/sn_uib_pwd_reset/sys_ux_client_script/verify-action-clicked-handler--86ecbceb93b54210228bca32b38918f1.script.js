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
    const verifyObj = {
        requestDetail: {
            sysparm_sms_verification_mode: api.data.get_initial_sms_verification_data.output.mode,
            sysparm_answer_sms_code: api.state.inputSMSCodeState.value
        },
        errorMessagePrefix: await helpers.translate("Incorrect verification code entered.")
    };
    api.emit("PWD_RESET_UIB#DISPATCH_VERIFY_FROM_SMS_VERIFICATION", verifyObj);
}
