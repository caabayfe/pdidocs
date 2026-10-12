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
    const result = event.payload.data ? event.payload.data.output : {};
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    if (!result.isValid) {
        helpers.timing.clearInterval(api.state.acccontUnlockPollingIntervalId);
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": await pwdResetUtil.getTranslation(helpers, "Account unlock error!"),
                "icon": "error",
                "subHeading": result.errorMessage
            }
        });
        return;
    }

    if (result.data.state === pwdResetUtil.uiConstants.WORKFLOW_CONTEXT_FINISHED_STATE) {
        helpers.timing.clearInterval(api.state.acccontUnlockPollingIntervalId);
        api.emit("PWD_RESET_UIB#HANDLE_NAVIGATION_FROM_RESET_PAGE", {
            route: "success-password-reset-snc",
            token: result.token,
            additionalInfo: {
                heading: await pwdResetUtil.getTranslation(helpers, "User account unlocked!"),
                subHeading: await pwdResetUtil.getTranslation(helpers, "The user can start using their system now.")
            }
        });
    } else if (result.data.state === pwdResetUtil.uiConstants.WORKFLOW_CONTEXT_FAULTED_STATE || result.data.state === pwdResetUtil.uiConstants.WORKFLOW_CONTEXT_CANCELLED_STATE) {
        helpers.timing.clearInterval(api.state.acccontUnlockPollingIntervalId);
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": await pwdResetUtil.getTranslation(helpers, "Account unlock error!"),
                "icon": "error",
                "subHeading": result.errorMessage
            }
        });
    } else {
        api.setState("isUnlockButtonDisabled", false);
        api.setState("isResetButtonDisabled", false);
    }
}
