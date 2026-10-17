/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        var workspaceId = event.context.item.value.workspaceId;
        var workspaceName = event.context.item.value.workspace_name;
        var queryCondition = "workspace="+workspaceId;  
        api.setState('workSpaceId', workspaceId); 
        api.setState('workSpaceLabel', workspaceName); 
        api.setState('queryCondition', queryCondition);
        api.setState('displayToggle',false);
}
