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
    const outputErrors = api.data.output.errors;
    
    if (outputErrors && outputErrors.length > 0) {
        api.setState('report_state', {
            illustration: 'error',
            heading: {
                label: await helpers.translate('Error'),
                level: 3,
            },
            content: await helpers.translate('An error occured: {0} - {1}', outputErrors[0].errorType, outputErrors[0].message),
            actions: [{
                label: await helpers.translate('Retry'),
                prominType: 'refresh'
            }]
        });
    }
}
