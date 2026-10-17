/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let currentView = { ...api.state.currentView
    };
    currentView = {
        view: api.state.VIEWS.BREAKDOWNS_LIST,
        params: {},
    };
    api.setState('currentView', currentView);
    api.setState('breakdownsListRefreshState', {
        timestamp: Date.now(),
        background: false,
    });
    api.setState('breakdownsListSelectedRecords', []);
    api.data.get_project_entities.refresh();

    // If selected stage is not scope your analysis, that means save breakdown action
    // was triggered by stepper navigation. Continue with navigation because save breakdown
    // succeeded.
    if (api.state.selectedStage !== 'scope-your-analysis') {
        helpers.navigate.to('promin_project', {
            projectId: api.context.props.projectId,
            stage: api.state.selectedStage,
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
}
