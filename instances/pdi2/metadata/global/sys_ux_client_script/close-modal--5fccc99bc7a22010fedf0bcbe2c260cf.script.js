/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.emit("RECORD#RELATED_LIST_REFRESH_REQUESTED", {
        relatedListName: "m2m_connected_content.knowledge"
    });
    helpers.modal.close();
}
