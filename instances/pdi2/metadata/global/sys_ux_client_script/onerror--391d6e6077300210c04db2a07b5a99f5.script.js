/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var errorMsg = await helpers.translate("Unable to process the item");
    api.emit("VA_CONTROL#VALUE_SENT", {
        value: {
            status: "ERROR",
            message: errorMsg
        }
    });
}
