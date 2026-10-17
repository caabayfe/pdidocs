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
    const {
        findingDefId,
        findingSource,
    } = event.payload;

    const projectId = api.state.model_definition_id;

    if (findingSource === 'AUTOMATED') {
        helpers.navigate.to('configure-finding-pattern', {
            projectId,
        }, {
            findingId: findingDefId,
        }, true);
    } else if (findingSource === 'RULE_BASED') {
        helpers.navigate.to('rule-based-finding-setup', {
            classType: 'PROJECT',
            classId: projectId,
        }, {
            findingDefId,
        }, true);
    }
}
