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
        payload: { value, name }
    } = event;

    if (name === 'timestamp' && value) {
        api.setState('refreshListPayload', {
            timestamp: Date.now()
        });
    }

}
