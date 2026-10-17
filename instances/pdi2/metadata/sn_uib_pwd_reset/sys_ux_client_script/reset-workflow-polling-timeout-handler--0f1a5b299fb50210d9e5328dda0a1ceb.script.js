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
    const heading = await helpers.translate("Workflow timed out");
    api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
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
            "subHeading": ""
        }
    });
}
