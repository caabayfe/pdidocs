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
    if (event.payload?.errors?.length) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'cancel-mining-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: event.payload?.errors[0]?.message,
                action: {
                    type: 'dismiss'
                },
            }]
        });
        return;
    }

    const {
        projectDefinition: {
            projectId,
        },
        state: miningState,
        trackerId,
        progress,
    } = api.data.cancel_mining_1.output.data.GlidePromin_Mutation.cancelMining;

    const updatedProject = {
        ...api.state.projectData,
        miningState: miningState,
        progress,
        ismining: false
    };

    api.setState('subscribe', false);
    api.setState("projectData", updatedProject);

}
