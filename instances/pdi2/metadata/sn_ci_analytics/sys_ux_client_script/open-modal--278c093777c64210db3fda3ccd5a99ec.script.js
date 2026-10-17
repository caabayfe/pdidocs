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
        case 'funnel_example_button':
            modalId = 'funnel_example_modal';
            break;
        case 'button_1':
            modalId = 'unsaved_funnel_details';
            break;
    }
    if (modalId)
        helpers.modal.open(`[component-id$='${modalId}']`);
}
