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
    var contentText = await helpers.translate("The URL format is incorrect. Use this format: https://www.sample.com or http://www.sample.com");
    var message = [{"status":"critical", "content": contentText, "icon":"circle-exclamation-outline"}];
    if (event.payload.value)
        api.setState('invalidURLMessage', JSON.stringify(message));
    else
        api.setState('invalidURLMessage', '[]');
}
