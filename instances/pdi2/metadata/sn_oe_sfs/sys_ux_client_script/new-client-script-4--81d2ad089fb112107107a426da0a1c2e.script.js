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
    api.setState('isFeatureEnabled', event.payload.value);
    api.setState('workSpaceLabel', null);
    api.setState('workSpaceId', null); 
    api.setState('isSessionTabEnabled', false);
    api.setState('label1', null);
    api.setState('label2', null);
    api.data.disable_session_tab_feature_all_workspaces_1.execute({
        tableName: 'information_session_tab_workspace_setting',
        isSessionTabFeatureEnabled: event.payload.value
    });
}
