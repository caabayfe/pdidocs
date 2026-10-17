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
    const updatedFields = {
        name: api.state.projectDetails.name,
        short_description: api.state.projectDetails.description,
          ...(api.state.selectedkpiDashboard || api.state.projectDetails.paDashboardId ? {
                        par_dashboard_id: api.state.selectedkpiDashboard || api.state.projectDetails.paDashboardId
                    } : {}),
        par_dashboard_id: api.state.selectedkpiDashboard || api.state.projectDetails.paDashboardId,
        status: api.state.projectTemplateDetails.isTemplate ? 'PUBLISHED' : api.state.projectStatus || api.state.projectDetails.status,
        template_type: api.state.projectTemplateDetails.templateType.selectedValue,
        is_le_progress: api.state.is_le_progress,
        auto_retire:false,
        restricted:false
    };
    const templateFields = Object.entries(updatedFields)
        .map(([key, value]) => `${key}=${value}`)
        .join('^');
             
    api.data.edit_promin_project.execute({
        'table': 'promin_project',
        'recordId': api.context.props.projectId,
        'templateFields': templateFields,
        'useSetDisplayValue': false
    });
}
