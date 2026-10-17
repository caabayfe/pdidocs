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
    api.emit('MODAL_SELECTED', {
        modalId: "[component-id$='execute_scan_modal']",
        showModal: true,
        bare: true,
        displayOptions: {
            size: "sm"
        },
        prepreserveState: false
    });
}
