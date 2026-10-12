/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        helpers.navigate.to('promin_project', {
            projectId: event.payload.data.output.data.snPo.GlidePromin.copyProminProject.newProjectId,
            stage: 'set-objectives',
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    } catch(err) {
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
}
