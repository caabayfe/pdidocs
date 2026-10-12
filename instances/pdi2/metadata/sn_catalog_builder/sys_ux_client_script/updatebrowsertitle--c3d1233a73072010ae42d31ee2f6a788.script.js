/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({api, event, helpers, imports}) {
    const previewTitle = await helpers.translate('Item preview');
    api.emit("CONTENT_UPDATED", {title: previewTitle});
}
