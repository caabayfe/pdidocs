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
    const pwdResetVerificationUtil = imports["sn_uib_pwd_reset.PwdResetUxfVerificationClientUtil"]();
    if (!event.payload.data.output) return;
    const sendSMSCodeResponseObj = {
        ...event.payload.data.output
    };
    if (!sendSMSCodeResponseObj.tokenValidationResult.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_SMS_VERIFICATION", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": await pwdResetUtil.getTranslation(helpers, "Oops! Something went wrong."),
                "icon": "error",
                "subHeading": sendSMSCodeResponseObj.tokenValidationResult.errorMessage,
            }
        });
        return;
    }
    const statusCode = sendSMSCodeResponseObj.response.statusCode;
    if (statusCode === pwdResetVerificationUtil.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.INVALID_REQUEST_ERROR) {
        let errorMessageHeader = await pwdResetUtil.getTranslation(helpers, "Request expired.");
        let errorMessageSubheader = await pwdResetUtil.getTranslation(helpers, "The password reset request is no longer valid. Try again.");
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_SMS_VERIFICATION", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": errorMessageHeader,
                "icon": "error",
                "subHeading": errorMessageSubheader
            }
        });
        return;
    }

    const sendSMSCodeButtonState = {
        ...api.state.sendSMSCodeButtonState
    };

    const sendSMSCodeResponse = {
        ...api.state.sendSMSCodeResponse
    };

    sendSMSCodeResponse.pauseWindow = sendSMSCodeResponseObj.pauseWindow;

    const processedResponse = await pwdResetVerificationUtil.handleSendVerificationCodeResponse(
        sendSMSCodeResponseObj.response, helpers
    );

    sendSMSCodeResponse.statusMessage = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.sendCodeResponse.statusMessage, sendSMSCodeResponse.statusMessage
    );

    if (processedResponse.sendCodeResponse.rateLimitMessage)
        sendSMSCodeResponse.rateLimitMessage = await helpers.translate("Maximum resend limit reached!");

    //redirect to error page if per day SMS quota for the user is already over
    if (sendSMSCodeResponse.rateLimitMessage && sendSMSCodeButtonState.variant === "primary") {
        let errorMessageHeader = await pwdResetUtil.getTranslation(helpers, "Verification code limit reached!");
        let errorMessageSubheader = processedResponse.sendCodeResponse.rateLimitMessage;
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_SMS_VERIFICATION", {
            "errorPageObj": {
                "actions": {
                    "createRecord": {
                        "isHidden": false,
                        "variant": "secondary"
                    },
                    "restart": {
                        "isHidden": false,
                        "variant": "secondary"
                    }
                },
                "content": await pwdResetUtil.getErrorContentForMaxVerCodeLimitReached(helpers),
                "heading": errorMessageHeader,
                "icon": "error",
                "subHeading": errorMessageSubheader,
                "shortDescription": await pwdResetUtil.getTranslation(helpers, "User needs a password reset, but has exceeded the daily SMS verification code limit.")
            }
        });
    }

    const timerState = {
        ...api.state.timerState
    };

    const inputSMSCodeState = {
        ...api.state.inputSMSCodeState
    };

    inputSMSCodeState.isHidden = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.inputCodeState.isHidden, inputSMSCodeState.isHidden
    );

    timerState.isHidden = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.timerState.isHidden, timerState.isHidden
    );

    timerState.start = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.timerState.start, timerState.start
    );

    sendSMSCodeButtonState.label = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.sendCodeButtonState.label, sendSMSCodeButtonState.label
    );

    sendSMSCodeButtonState.variant = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.sendCodeButtonState.variant, sendSMSCodeButtonState.variant
    );

    sendSMSCodeButtonState.disable = pwdResetVerificationUtil.handleConditionalAssignment(
        processedResponse.sendCodeButtonState.disable, sendSMSCodeButtonState.disable
    );

    api.setState("timerState", timerState);
    api.setState("inputSMSCodeState", inputSMSCodeState);
    api.setState("sendSMSCodeResponse", sendSMSCodeResponse);
    api.setState("sendSMSCodeButtonState", sendSMSCodeButtonState);
}
