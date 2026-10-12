/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'mark_project_for_deletion-msg',
                status: event.name == "DATA_OP_SUCCEEDED" ? 'positive' : 'critical',
                icon: 'info-circle-outline',
                content: event.name == "DATA_OP_SUCCEEDED" ? await helpers.translate('Project is marked for deletion') : event.payload?.errors[0]?.message,
                action: {
                    type: 'dismiss'
                }
            }]
        });

    helpers.navigate.to('process-models', {}, null, true);

    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
