/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!event.payload.step || event.payload.step === api.context.props.step) {
        return;
    }

    helpers.navigate.to('process-configuration-details', {
        processId: api.context.props.processId,
        step: event.payload.step,
    }, null, true);

    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
