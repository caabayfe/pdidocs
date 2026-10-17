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
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: "viewport_nsk",
        route: event.payload.route,
        fields: event.payload.fields,
        params: event.payload.params
    });
    helpers.modal.open("[component-id$='modal_viewport_1']", {
        size: 'lg',
        bare: true
    });
}
