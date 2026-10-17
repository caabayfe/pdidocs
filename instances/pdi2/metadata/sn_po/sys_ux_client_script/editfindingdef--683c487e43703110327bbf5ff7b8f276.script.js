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
    if (api.state.projectData.ismining) {
        return;
    }

    if (api.state.listTable === 'promin_automated_finding') {
        helpers.navigate.to('configure-finding-pattern', {
            projectId: api.context.props.projectId,
        }, {
            findingId: event.payload.cell?.metadata?.referenceSysId,
        }, true);
    } else if (api.state.listTable === 'promin_finding_def') {
        helpers.navigate.to('rule-based-finding-setup', {
            classType: 'PROJECT',
            classId: api.context.props.projectId,
        }, {
            findingDefId: event.payload.cell?.metadata?.referenceSysId,
        }, true);
    }
}
