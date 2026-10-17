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
    if (event.payload.value == "123") {
        api.emit('MODAL_SELECTED', {
            modalId: "[component-id$='advanced_modal']",
            showModal: true,
            bare: true,
            displayOptions: {
                size: "md"
            },
            prepreserveState: false
        });
    }
}
