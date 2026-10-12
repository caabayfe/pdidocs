/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { title } = event.payload;
    if (title) {
        api.emit("CONTENT_UPDATED", {
            title: event.payload.title
        });
    }
}
