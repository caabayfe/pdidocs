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
    const pwdResetUxfVerificationUtil = imports["sn_uib_pwd_reset.PwdResetUxfVerificationClientUtil"]();

    if (!event.payload.data.output) return;

    const emailCodeResponseObj = { ...event.payload.data.output
    };

    if (!emailCodeResponseObj.tokenValidationResult.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_EMAIL_VERIFICATION", {
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
                "subHeading": emailCodeResponseObj.tokenValidationResult.errorMessage
            }
        });
        return;
    }
    const sendEmailCodeButtonState = { ...api.state.sendEmailCodeButtonState
    };
    const statusCode = emailCodeResponseObj.emailStatus.statusCode;
    const statusMessage = emailCodeResponseObj.emailStatus.statusMessage;
    const responseObj = { ...api.state.emailDeliveryResponseObject
    };
    if (statusCode === pwdResetUxfVerificationUtil.CONSTANTS.SEND_CODE_RESPONSE_STATUS_CODE.INVALID_REQUEST_ERROR) {
        let errorMessageHeader = await pwdResetUtil.getTranslation(helpers, "Request expired.");
        let errorMessageSubheader = await pwdResetUtil.getTranslation(helpers, "The password reset request is no longer valid. Try again.");
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_EMAIL_VERIFICATION", {
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
    const processedResponse = await pwdResetUxfVerificationUtil.handleSendVerificationCodeResponse(emailCodeResponseObj.emailStatus, helpers);
    responseObj.statusMessage = pwdResetUxfVerificationUtil.handleConditionalAssignment(processedResponse.sendCodeResponse.statusMessage, responseObj.statusMessage);
    responseObj.startTimer = pwdResetUxfVerificationUtil.handleConditionalAssignment(processedResponse.timerState.start, responseObj.startTimer);
    responseObj.isPerDayLimitReached = processedResponse.sendCodeResponse.rateLimitMessage === null ? responseObj.isPerDayLimitReached : true;
    responseObj.pauseWindow = emailCodeResponseObj.pauseWindow;

    //redirect to error page if per day Email quota for the user is already over
    if (responseObj.isPerDayLimitReached && sendEmailCodeButtonState.variant === "primary") {
        let errorMessageHeader = await pwdResetUtil.getTranslation(helpers, "Verification code limit reached!");
        let errorMessageSubheader = processedResponse.sendCodeResponse.rateLimitMessage;
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_EMAIL_VERIFICATION", {
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
                "subHeading": `<span>${errorMessageSubheader}</span>`,
                "shortDescription": await pwdResetUtil.getTranslation(helpers, "User needs a password reset, but has exceeded the daily email verification code limit.")
            }
        });
    }

    sendEmailCodeButtonState.label = pwdResetUxfVerificationUtil.handleConditionalAssignment(processedResponse.sendCodeButtonState.label, sendEmailCodeButtonState.label);
    sendEmailCodeButtonState.variant = pwdResetUxfVerificationUtil.handleConditionalAssignment(processedResponse.sendCodeButtonState.variant, sendEmailCodeButtonState.variant);
    sendEmailCodeButtonState.isDisabled = pwdResetUxfVerificationUtil.handleConditionalAssignment(processedResponse.sendCodeButtonState.disable, sendEmailCodeButtonState.isDisabled);
    api.setState('emailDeliveryResponseObject', responseObj);
    api.setState("sendEmailCodeButtonState", sendEmailCodeButtonState);
}
