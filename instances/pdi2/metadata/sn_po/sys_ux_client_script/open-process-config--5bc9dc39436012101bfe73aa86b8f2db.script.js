/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { processConfigId, openInNewTab, step, activeTab } = event.payload;
    if (!processConfigId) {
        return;
    }

    helpers.navigate.to('process-configuration-details', {
        processId: processConfigId,
        step: step || 'process-details'
    }, null, true);

    if (!openInNewTab) {
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
}
