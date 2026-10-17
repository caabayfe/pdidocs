/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const outputErrors = api.data.fetch_promin_header_state_1.output.errors;
    if (outputErrors && outputErrors.length > 0) {
        api.setState('page_empty_state', {
            errorType: outputErrors[0].errorType,
            message: outputErrors[0].message
        });
        api.emit('SCREEN_STATUS_CHANGED', {
            title: await helpers.translate('Error'),
        });
    }
}
