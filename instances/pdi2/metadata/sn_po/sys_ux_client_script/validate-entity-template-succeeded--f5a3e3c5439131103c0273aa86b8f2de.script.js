/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const updatedFields = {
        name: api.state.projectDetails.name,
        short_description: api.state.projectDetails.description,
        ...(api.state.selectedkpiDashboard ? {
                        par_dashboard_id: api.state.selectedkpiDashboard
                    } : {}),
        status: 'PUBLISHED',
        is_template: true,
        template_type: api.state.projectTemplateDetails.templateType.selectedValue,
        auto_retire:false,
        restricted:false
    };
    const templateFields = Object.entries(updatedFields)
        .map(([key, value]) => `${key}=${value}`)
        .join('^');
    api.data.create_record_1.execute({
        'table': 'promin_project',
        'templateFields': templateFields,
        'useSetDisplayValue': false
    });
}
