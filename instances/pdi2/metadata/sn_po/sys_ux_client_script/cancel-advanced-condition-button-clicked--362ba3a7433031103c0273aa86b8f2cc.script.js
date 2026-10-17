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
    const selectedEntity = { ...api.state.selectedEntity };
    const entityForm = { ...api.state.entityForm };
    entityForm.fields.includeApprovals.value = selectedEntity.include_approvals.value;
    api.setState('entityForm', entityForm);
    
    let currentView = { ...api.state.currentView };
    currentView = {
        view: api.state.VIEWS.LANDING_PAGE,
        params: {
            mode: '',
        },
    };
    api.setState('currentView', currentView);
    api.setState('selectedContentTreeItem', ['process-tables-view']);
}
