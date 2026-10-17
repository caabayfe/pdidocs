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
    const result = event.payload.data ? event.payload.data.output : {};
    if (!result.isValid) {
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

    if (result.data.isFlow) { //IH subflow case
        api.emit("PWD_RESET_UIB#HANDLE_NAVIGATION_FROM_RESET_PAGE", {
            route: "success-password-reset-snc",
            token: result.token,
            additionalInfo: {
                heading: await pwdResetUtil.getTranslation(helpers, "User account unlocked!"),
                subHeading: await pwdResetUtil.getTranslation(helpers, "The user can start using their system now.")
            }
        });
    } else { //Workflow case
        api.setState('contextId', result.data.wfContextId);
        startUnlockAccountPolling();
    }

    function startUnlockAccountPolling() {
        let timeElapsed = 0;
        const refreshRate = api.state.pollingInfo.refreshRate;
        const timeOut = api.state.pollingInfo.timeOut;
        const intervalId = helpers.timing.setInterval(async () => {
            timeElapsed += refreshRate;
            if (timeElapsed < timeOut) {
                api.data.pwd_reset_get_account_unlock_status_on_polling.execute({
                    token: api.state.token,
                    contextId: result.data.wfContextId
                });
            } else {
                helpers.timing.clearInterval(intervalId);
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
                        "subHeading": await pwdResetUtil.getTranslation(helpers, "Error while unlocking the account, please try again.")
                    }

                });
            }
        }, refreshRate);
        api.setState("acccontUnlockPollingIntervalId", intervalId);
    }
}
