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
        case 'button_bare_1':
            modalId = 'list_example_funnel_modal';
            break;
    }
    if (modalId)
        helpers.modal.open(`[component-id$='${modalId}']`);
}
