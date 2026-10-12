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
    const response = api.data.get_pwd_reset_identify_page_details.output;
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    if (!response) {
        return;
    }
    switch (event.name) {
        case "PWD_RESET_UIB#INITIATE_USER_IDENTIFICATION":
            const payload = {
                userSysId: event.payload.userSysId,
                processSysId: event.payload.pwdProcessID,
                token: response.token
            };
            api.setState("isIdentificationButtonDisabled", true);
            api.data.pwd_reset_sdesk_user_identification.execute(payload);
            break;
        case "DATA_OP_SUCCEEDED":
            const result = event.payload.data.output;
            if (result.isValid) {
                const payload = {
                    route: "verify-password-reset-snc",
                    token: response.token
                };
                api.emit("PWD_RESET_UIB#HANDLE_PAGE_NAVIGATION", payload);
            } else {
                const heading = await pwdResetUtil.getTranslation(helpers, "Oops! Something went wrong.");
                if (!result.tokenValidationResult.isValid) {
                    api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_IDENTIFY", {
                        "errorPageObj": {
                            "actions": {
                                "restart": {
                                    "isHidden": false,
                                    "variant": "primary"
                                }
                            },
                            "content": "",
                            "heading": heading,
                            "icon": "error",
                            "subHeading": result.tokenValidationResult.errorMessage
                        }
                    });
                    return;
                }
                api.emit("PWD_RESET_UIB#HANDLE_ERROR_RESPONSE", result.errorMessage);
                api.setState("isIdentificationButtonDisabled", false);
            }
            break;
    }
}
