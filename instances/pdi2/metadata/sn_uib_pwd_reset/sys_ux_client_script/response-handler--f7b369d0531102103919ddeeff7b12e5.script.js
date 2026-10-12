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
    const response = event.payload.data.output ? event.payload.data.output : {};
    if (!response.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_VERIFY", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "heading": await pwdResetUtil.getTranslation(helpers, "Oops! Something went wrong."),
                "icon": "error",
                "subHeading": response.errorMessage
            }
        });
        return;
    }
    const data = response.data;
    if (data.isRetry) {
        const totalRetryCount = api.state.totalRetryCount;
        let errorMessageSuffix = await pwdResetUtil.getTranslation(helpers, "You have {0} attempts remaining. Try again.", [totalRetryCount - data.retryCount]);
        const errorMessage = api.state.currVerificationErrorMessagePrefix + " " + errorMessageSuffix;
        showErrorResponse(errorMessage, await pwdResetUtil.getTranslation(helpers, "Error!"));
        api.setState("token", response.token);
        api.setState("isVerificationButtonDisabled", false);
        return;
    } else if (data.status === "block") {
        if (data.retryCount < 0) {
            // request is no longer valid 
            let errorMessageHeader = await pwdResetUtil.getTranslation(helpers, "Request expired.");
            let errorMessageSubheader = await pwdResetUtil.getTranslation(helpers, "The password reset request is no longer valid. Try again.");
            api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_VERIFY", {
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
        } else {
            // max retry attempts is over
            const verifyPageDetails = api.data.get_pwd_reset_verify_page_details.output ? api.data.get_pwd_reset_verify_page_details.output : {
                data: {}
            };
            let processName = verifyPageDetails.data.processName ? verifyPageDetails.data.processName : "";
            const maxAttemptWindow = verifyPageDetails.data.maxAttemptWindow ? verifyPageDetails.data.maxAttemptWindow / 60 : "";
            processName = `<strong>${processName}</strong>`;
            const errorMessageHeader = await pwdResetUtil.getTranslation(helpers, "Maximum verification attempts reached!");
            const errorMessageSubheader = await pwdResetUtil.getTranslation(helpers, "The verification attempts for {0} process are exhausted. You can’t continue with this session.", [processName]);
            api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_VERIFY", {
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
                    "content": await getErrorContentForMaxAttempts(maxAttemptWindow),
                    "heading": errorMessageHeader,
                    "icon": "error",
                    "subHeading": `<span>${errorMessageSubheader}</span>`,
                    "shortDescription": await pwdResetUtil.getTranslation(helpers, "User needs a password reset, but has exceeded the maximum verification attempt limit.")
                }
            });
            return;
        }
    }
    const verificationIndex = api.state.currVerificationIndex + 1;
    const verificationDetails = api.state.verificationDetails;
    api.setState("token", response.token);
    if (verificationIndex < verificationDetails.length) {
        const isLastVerification = pwdResetUtil.isLastVerification(verificationIndex, verificationDetails.length);
        api.setState("isLastVerification", isLastVerification);
        api.setState("currVerificationIndex", verificationIndex);
        api.emit("PWD_RESET_UIB#NAVIGATE_TO_NEXT_VERIFICATION", {
            route: verificationDetails[verificationIndex].route,
            token: response.token,
            verificationId: verificationDetails[verificationIndex].verificationId,
            isLastVerification: isLastVerification
        });
        api.setState("isVerificationButtonDisabled", false);
    } else {
        api.data.pwd_reset_verify_all_verifications.execute({
            reqDetail: api.state.allRequestDetails,
            token: response.token
        });
    }

    function showErrorResponse(info, header) {
        let errorObj = {
            "header": header,
            "info": info,
            "type": pwdResetUtil.uiConstants.CRITICAL
        };
        api.emit("PWD_RESET_UIB#SHOW_VERIFICATION_PAGE_ALERT", {
            notificationObj: errorObj
        });
    }

    async function getErrorContentForMaxAttempts(maxAttemptWindow) {
        const str1 = await pwdResetUtil.getTranslation(helpers, "Try one of the following.");
        const str2 = await pwdResetUtil.getTranslation(helpers, "Choose another process for password reset.");
        const str3 = await pwdResetUtil.getTranslation(helpers, "Try again after {0} hour(s) to use the same process.", [maxAttemptWindow]);
        const str4 = await pwdResetUtil.getTranslation(helpers, "Create an incident for the system administrator.");
        return "<p style='padding-left: var(--now-scalable-space--sm);'>" + str1 + "</p><div><ul><li>" + str2 + "</li><li>" + str3 + "</li><li>" + str4 + "</li></ul></div>";
    }
}
