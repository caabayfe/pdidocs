/**
 * @param {params} params
 * @param {api} params.api
 */
function evaluate({
    api
}) {
    const project = api.context.props.modelDefinition;
    return !(project.paDashboardId && !project.canAccessPaDashboard);
}
