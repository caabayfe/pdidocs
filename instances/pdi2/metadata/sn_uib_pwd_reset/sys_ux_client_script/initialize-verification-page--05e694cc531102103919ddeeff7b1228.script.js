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
    const response = api.data.get_pwd_reset_verify_page_details.output ? api.data.get_pwd_reset_verify_page_details.output : {};
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
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
    const verificationDetails = response.data.verificationDetails;
    const minimumSelection = response.data.minimumSelection;
    const totalVerifications = verificationDetails.length;
    const isVerificationSelectionEnabled = !!response.data.isVerificationSelection;
    const currVerificationIndex = api.state.currVerificationIndex;
    const isLastVerification = pwdResetUtil.isLastVerification(currVerificationIndex, totalVerifications);
    
    api.setState("isLastVerification", isLastVerification);
    api.setState("token", response.token);
    api.setState("totalRetryCount", response.totalRetryCount);
    api.setState("verificationDetails", verificationDetails);
    api.setState("minimumSelection", minimumSelection);
    api.setState("isVerificationSelectionEnabled", isVerificationSelectionEnabled);

    if (isVerificationSelectionEnabled) {
        api.setState("isVerificationLoading", false);
        api.setState("optionalVerSelectionHeading", await pwdResetUtil.getTranslation(helpers, "Select {0} of {1} verification methods below to proceed.", [minimumSelection, totalVerifications]));
    } else {
        api.emit("PWD_RESET_UIB#NAVIGATE_TO_NEXT_VERIFICATION", {
            route: verificationDetails[0].route,
            token: response.token,
            verificationId: verificationDetails[0].verificationId,
            isLastVerification: isLastVerification
        });
    }
}
