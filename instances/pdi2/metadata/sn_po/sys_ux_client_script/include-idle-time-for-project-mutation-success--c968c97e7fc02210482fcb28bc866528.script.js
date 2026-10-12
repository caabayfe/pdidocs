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
    } = event.payload.data.output.data.snPo.GlidePromin.includeIdleTimeForProject;

    if (success) {
        api.setState('projectIdleTimeEnabled', value);
        if (value) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'idle-time-mutation-warning',
                    status: 'positive',
                    icon: 'circle-check-outline',
                    content: {
                        type: 'html',
                        value: '<span><strong>' + await helpers.translate('Idle time included. ')+'</strong>' + message +'</span>',
                    },
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        }

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
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'idle-time-mutation-warning',
                status: 'critical',
                icon: 'exclamation-circle-outline',
                header: await helpers.translate('Unable to include idle time.'),
                content: {
                    type: 'html',
                    value: message
                },
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }
}
