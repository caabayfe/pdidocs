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
        type
    } = event.payload;

    if (type === 'AUTOMATED') {
        helpers.navigate.to('configure-finding-pattern', {
            projectId: api.context.props.processId,
        }, {
            findingId: findingDefId,
        }, true);
    } else if (type === 'RULE_BASED') {
        helpers.navigate.to('rule-based-finding-setup', {
            classType: 'PROCESS',
            classId: api.context.props.processId,
        }, {
            findingDefId: findingDefId,
        }, true);
    }
}
