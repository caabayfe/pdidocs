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
    if (event.elementId == 'get_process_configuration') {
        const {
            touchPoints,
            id,
        } = event.payload.data.output.data.GlidePromin_Query.configuration.process;
        if (touchPoints.enabledForProjects && api.state.automatedFindingForm.name.applyToSource === 'project') {
            const entityId = api.state.entityId;
            const link = `<a href="/now/experience/promin/promin_project/${api.context.props.projectId}/scope-your-analysis/params/section/${entityId}-metrics">${await helpers.translate('enable it in the project')}</a>`;
            //redirect to scope your analysis metrics section
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'touch-points-mutation-warning',
                    status: 'warning',
                    icon: 'exclamation-circle-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + await helpers.translate('Touchpoint metric isn\'t enabled for this project. To generate results, {0}', link) + '</span>',
                    },
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        } else if(!touchPoints.enabledForProjects) {
            const link = `<a href="/now/experience/promin/process-configuration-details/${id}/impact-metrics">${await helpers.translate('configure it in the process configuration')}</a>`;
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'touch-points-mutation-warning',
                    status: 'warning',
                    icon: 'exclamation-circle-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + await helpers.translate('Touchpoint analysis isn\'t configured for the \'{0}\' process. To generate results, {1}', [api.state.automatedFindingForm.table.displayValue, link]) + '</span>',
                    },
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
        }
        return;

    } else {
        const {
            projectConfiguration
        } = event.payload.data.output.data.GlidePromin_Query;

        const {
            projectEntities,
        } = projectConfiguration;
        api.setState('entityId', projectEntities[0].entityId);

        const isTouchpointType = api.state.automatedFindingForm.type.value === "NODE_TOUCH_POINT_OUTLIER" || api.state.automatedFindingForm.type.value === "EXTREME_NODE_TOUCH_POINT";
        if (!projectEntities[0].touchPointEnabled && isTouchpointType) {
            api.data.get_process_configuration.execute({
                table: projectEntities[0].table.name
            });
        }
    }
}
