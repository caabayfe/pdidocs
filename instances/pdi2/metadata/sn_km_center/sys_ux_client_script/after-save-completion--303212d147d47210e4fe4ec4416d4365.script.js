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
    api.data.fetch_knowledge_management_properties.refresh();
    api.setState('isSaveEnabled', false);
    api.setState('isSaving', false);
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "propertySaved",
            status: "info",
            icon: "info-circle-outline",
            content: {
                type: "string",
                value: event.payload.data.output.message
            },
            action: {
                type: "dismiss"
            }
        }],
    });
}
