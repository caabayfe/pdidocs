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
    if (!event.payload || !event.payload.tokenValidationResult) return;
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    const tokenValidationResult = event.payload.tokenValidationResult;
    if (!tokenValidationResult.isValid) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading":  await pwdResetUtil.getTranslation(helpers, "Oops! Something went wrong."),
                "icon": "error",
                "subHeading": tokenValidationResult.errorMessage
            }
        });
        return;
    }
    api.data.get_pwd_reset_page_details.refresh();
}
