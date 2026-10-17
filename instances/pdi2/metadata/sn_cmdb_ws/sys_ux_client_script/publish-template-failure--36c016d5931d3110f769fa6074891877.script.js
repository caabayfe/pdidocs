/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var errorMessage = event.payload.errors[0];

    const index = errorMessage.indexOf(":");
    if (index !== -1) {
        const extractedMessage = errorMessage.substring(index + 1).trim();
        if (extractedMessage !== '') {
            errorMessage = extractedMessage;
        }
    }

    helpers.translate(errorMessage).then((text) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "error_run",
                "status": "critical",
                "icon": "info-circle-outline",
                "content": text,
                "action": {
                    "type": "dismiss"
                }
            }]
        });

    });
    api.data.deduplication_template_get_library_tree.refresh();
    api.data.look_up_template.refresh();
}
