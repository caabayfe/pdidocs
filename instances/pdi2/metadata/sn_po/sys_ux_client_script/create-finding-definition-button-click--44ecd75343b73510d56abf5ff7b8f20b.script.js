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
    const { elementId } = event;
    const { projectId, processId } = api.context.props;

    if (elementId == 'findings_breadcrumbs') {
        if (processId != null) {
            helpers.navigate.to(undefined, undefined, {}, false, false, null, {
                url: `/nav_to.do?uri=%2Fpromin_process_def.do%3Fsys_id%3D${processId}`
            });
        } else {
            helpers.navigate.to("promin_project", {
                projectId,
                stage: 'find-improvement-opportunities'
            }, null, true);
        }
    } else if (elementId === 'custom_finding_definition') {
        helpers.navigate.to("rule-based-finding-setup", {
            classType: projectId ? 'PROJECT' : 'PROCESS',
            classId: projectId || processId,
        }, {
            findingDefId: null,
        }, true);
    } else {
        helpers.navigate.to("configure-finding-pattern", {
            projectId: api.context.props.projectId || api.context.props.processId,
        }, {
            patternName: event.elementId,
            findingId: undefined
        }, true);
    }
}
