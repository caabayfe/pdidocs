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
    const response = event.payload.data.output ? event.payload.data.output : {};
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

    const payload = {
        route: "reset-password-reset-snc",
        token: api.state.token,
        isEmailURLEnabled: response.isEmailURLEnabled
    };

    if (response.isEmailURLEnabled) {
        payload.route = "success-password-reset-snc";
        payload.additionalInfo = {
            heading: await pwdResetUtil.getTranslation(helpers, "Password reset instructions sent!"),
            subHeading: await pwdResetUtil.getTranslation(helpers, "Email/SMS with password reset instructions has been sent to the user's registered email/mobile number.")
        };
    }

    api.emit("PWD_RESET_UIB#HANDLE_NAVIGATION_FROM_VERIFY_PAGE", payload);
}
