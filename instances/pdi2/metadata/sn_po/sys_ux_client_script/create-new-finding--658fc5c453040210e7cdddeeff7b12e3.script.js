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
    helpers.navigate.to('promin_project', {
        projectId: api.state.model_definition_id,
        stage: 'find-improvement-opportunities'
    }, null, true);
}
