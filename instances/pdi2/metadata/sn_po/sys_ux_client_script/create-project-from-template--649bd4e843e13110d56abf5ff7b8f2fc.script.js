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
    api.data.create_project_from_template_1.execute({
        name: api.state.projectDetails.name,
        description: api.state.projectDetails.description || "",
        template: api.state.templateId,
        kpiDashboard: api.state.selectedkpiDashboard || "",
        autoRetire: api.state.autoRetire.value,
        restricted: api.state.restricted || false,
    });
}
