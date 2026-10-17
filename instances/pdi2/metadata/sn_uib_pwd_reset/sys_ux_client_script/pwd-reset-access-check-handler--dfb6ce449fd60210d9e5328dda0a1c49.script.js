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
    const heading = await helpers.translate("Access Denied");
    if (!api.data.pwd_reset_access_check.output) {
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE", {
            "pageDetails": {
                "buttonToShow": {
                    "isCloseButton": true
                },
                "content": "",
                "heading": heading,
                "icon": "error",
                "subHeading": ""
            }
        });
        return;
    }
    api.setState("hideStepper", false);
    api.emit("PWD_RESET_UIB#PAGE_NAVIGATOR", {
        route: "identify-password-reset-snc",
        token: null,
        additionalInfo: null
    });
}
