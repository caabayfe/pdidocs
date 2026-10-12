/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'copy-project-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: helpers.translateSync('Copy project failed'),
            action: {
                type: 'dismiss'
            },
        }],
    });
}
