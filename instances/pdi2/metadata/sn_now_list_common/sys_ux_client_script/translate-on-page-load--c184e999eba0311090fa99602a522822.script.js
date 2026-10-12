/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const successMessage = await helpers.translate('Record successfully updated');
    const failMessage = await helpers.translate('Record not updated');
    const successAlert = [{
        status: 'positive',
        content: successMessage,
        action: {
            type: 'dismiss'
        },
    }];
    const failAlert = [{
        status: 'critical',
        content: failMessage,
        action: {
            type: 'dismiss'
        },
    }];

    api.setState('successAlert', successAlert);
    api.setState('failAlert', failAlert);
}
