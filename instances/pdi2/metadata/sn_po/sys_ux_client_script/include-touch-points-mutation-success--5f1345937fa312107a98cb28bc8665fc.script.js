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
    const {
        success,
        value,
        message
    } = event.payload.data.output.data.snPo.GlidePromin.includeTouchPointMetrics;
    if (success) {
        api.setState('projectTouchPointsEnabled', value);
        api.setState('projectTouchPoints', {
            ...api.state.touchPoints,
            enabledForProjects: value
        });
        if (api.state.projectDetails.state?.value === "AVAILABLE") {
            const link = `<a href="/now/experience/promin/promin_project/${api.context.props.projectId}/overview">${await helpers.translate('Review and mine')}</a>`;
            // show notification to review and Mine only for mined projects
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'touch-points-mutation-warning',
                    status: 'warning',
                    icon: 'exclamation-circle-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + await helpers.translate('Re-mine the project to apply changes. {0}', link) + '</span>',
                    },
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        }
        // get entities list to refresh the metrics count
        api.data.get_entities_by_project.execute({
            projectId: api.context.props.projectId,
        });
    } else if (!success && message) {
        const {
            touchPointsStatus
        } = api.state;
        let notificationMessage;
        if (touchPointsStatus.fields.length > 0 && touchPointsStatus.newIncomingFields.length > 0) {
            // update metrics message
            notificationMessage = await helpers.translate('Unable to update metrics.');
        } else {
            // include/create metrics
            notificationMessage = await helpers.translate('Unable to include touch point metrics.');
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'save-activity-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                header: notificationMessage,
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }
}
