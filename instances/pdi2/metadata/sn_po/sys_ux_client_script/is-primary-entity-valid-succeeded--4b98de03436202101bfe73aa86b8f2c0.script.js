/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        success: isValidEntity,
        message
    } = event.payload?.data?.output?.data?.snPo?.GlidePromin?.isPrimaryEntityValid;

    if (isValidEntity) {
        const updatedFields = {
            name: api.state.projectDetails.name,
            short_description: api.state.projectDetails.description,
            ...(api.state.selectedkpiDashboard ? {
                par_dashboard_id: api.state.selectedkpiDashboard
            } : {}),
            status: api.state.projectStatus,
            auto_retire: api.state.autoRetire.value,
            restricted: api.state.restricted
        };
        const templateFields = Object.entries(updatedFields)
            .map(([key, value]) => `${key}=${value}`)
            .join('^');
        api.data.create_record_1.execute({
            'table': 'promin_project',
            'templateFields': templateFields,
            'useSetDisplayValue': false
        });
    } else {
        api.setState('alertMessage', message);
        api.setState('isAlertHidden', false);
    }
}
