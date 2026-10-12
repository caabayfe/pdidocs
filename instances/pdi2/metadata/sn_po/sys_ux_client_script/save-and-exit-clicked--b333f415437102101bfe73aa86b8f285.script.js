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
    if (api.context.props.classType === 'PROJECT') {
        helpers.navigate.to('promin_project', {
            projectId: api.context.props.classId,
            stage: 'find-improvement-opportunities'
        }, null, true);
    } else if (api.context.props.classType === 'PROCESS') {
        helpers.navigate.to('process-configuration-details', {
            processId: api.context.props.classId,
            step: 'improvement-opportunities'
        }, {
            activeTab: 'RULE_BASED'
        }, true);
    }

    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
