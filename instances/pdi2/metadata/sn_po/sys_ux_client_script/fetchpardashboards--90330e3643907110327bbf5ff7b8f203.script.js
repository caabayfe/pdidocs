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
    if (event.payload.value === true) {
        api.data.get_dashboard_data.refresh();
        api.setState('tableNameFetchInput', 'par_dashboard');
        api.setState('hideKPISection', false);
    } else {
        api.setState('hideKPISection', true);
        // Unset selected dashboard id when unchecked
        api.setState('selectedkpiDashboard', null);
        if ('paDashboardId' in api.state.projectDetails) {
            const projectDetails = {...api.state.projectDetails};
            projectDetails.paDashboardId = null;
            projectDetails.paDashboardName = null;
            api.setState('projectDetails', projectDetails);
        }
    }
}
