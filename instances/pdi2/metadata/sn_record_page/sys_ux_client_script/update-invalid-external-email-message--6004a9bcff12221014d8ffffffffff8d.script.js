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
    if (event.payload.value) {
        const contentText = await helpers.translate("Invalid email ID. Ensure that the email ID is complete.");
        const invalidExternalEmailMessages = [{
            "status": "critical",
            "content": contentText,
            "icon": "circle-exclamation-outline"
        }];
        api.setState('invalidExternalEmailMessages', invalidExternalEmailMessages);
    } else {
        api.setState('invalidExternalEmailMessages', []);
    }
}
