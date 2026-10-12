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
    const {
        elementId,
        payload
    } = event;
    const {
        eventName,
        eventPayload
    } = payload;
    if (eventName === 'OPEN_INFO_MODAL') {
        const {
            header,
            content,
            buttonLabel
        } = eventPayload;
        api.setState('infoModalData', {
            header,
            content,
            buttonLabel
        });
        helpers.modal.open(`[component-id$='info_modal']`);
    }
}
