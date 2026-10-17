/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        api.setState("showEditLoading",true);

        const currentContextId = api.data.playbook_activity_ui.playbookCardProperties.contextId;
        if(api.state.activityContextId === currentContextId) {
            api.data.restart_activity_1.refresh();
        }else
            api.setState("activityContextId", currentContextId);
    
}
