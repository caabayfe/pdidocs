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
    var modalId = '';
    switch (event.elementId) {
        case 'example_moda_close_button':
            modalId = 'funnel_example_modal';
            break;
    }
    if (modalId)
        helpers.modal.close(`[component-id$='${modalId}']`);
}
