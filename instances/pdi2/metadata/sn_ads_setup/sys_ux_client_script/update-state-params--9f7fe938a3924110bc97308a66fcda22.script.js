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
    if (!event) return;
    // Due to some defect in sn-forms component tabTitle comes as 'Create new interaction' so overriding it with correct name.
    api.emit('SCREEN_STATUS_CHANGED', {
        'title': "Setup"
    });
    const {
        name,
        elementId,
        payload
    } = event;
    const result = payload.data.output.result;
    const error = result.error;
    if (error) {
        api.setState('showAlert', true);
        api.setState('alertMsg', error);
    } else {
        const {
            interactionSysId,
            setupName,
            setupDescription,
            huiStatus
        } = result;
        api.setState('interactionId', interactionSysId);
        api.setState('setupName', setupName);
        api.setState('huiStatus', huiStatus);
        api.setState('setupDescription', setupDescription);

    }
}
