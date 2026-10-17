/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('activitiesListRefreshState', {
        timestamp: Date.now(),
        background: false,
    });
    api.setState('activitiesListSelectedRecords', []);
    api.data.get_project_entities.refresh();

    if (api.state.currentView.view !== "METRICS") {
        api.setState('currentView', {
            params: {},
            view: api.state.VIEWS.ACTIVITIES_LIST,
        });
    }
    
    api.data.get_process_configuration_for_activity.execute({
        table: api.state.selectedEntity.table.value
    });
}
