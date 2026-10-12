/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.fetch_all_collaboration_chats_1.output && api.data.fetch_all_collaboration_chats_1.output.isTeamsPluginActive && api.data.fetch_all_collaboration_chats_1.output.isSidebarSupportedOnSOW && api.data.fetch_all_collaboration_chats_1.output.numberOfSidebarChats > 0 && api.data.fetch_all_collaboration_chats_1.output.numberOfTeamsChats > 0)
        return true;
    else
        return false;
}
