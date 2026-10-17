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
    let message = '';

    try {
        if ('createProminEntity' in event.payload.data.output.data.snPo.GlidePromin) {
            message = event.payload.data.output.data.snPo.GlidePromin.createProminEntity.message;
        } else if ('updateProminEntity' in event.payload.data.output.data.snPo.GlidePromin) {
            message = event.payload.data.output.data.snPo.GlidePromin.updateProminEntity.message;
        } else {
            message = 'Something went wrong';
        }
    } catch (err) {
        message = 'Something went wrong';
    }

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'create-promin-entity-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: message,
            action: {
                type: 'dismiss'
            },
        }],
    });

    // If selected stage is not scope your analysis, that means save entity action
    // was triggered by stepper navigation. Because save entity failed, revert stepper
    // stage back to scope your analysis.
    if (api.state.selectedStage !== 'scope-your-analysis') {
        api.setState('selectedStage', 'scope-your-analysis');
    }
}
