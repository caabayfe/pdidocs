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
    if (api.state.exit) {
        helpers.navigate.to("process-models", {}, {
            projectId: api.state.projectId
        }, true);
    } else {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'scope-your-analysis'
        }, null, true);
    }
    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
