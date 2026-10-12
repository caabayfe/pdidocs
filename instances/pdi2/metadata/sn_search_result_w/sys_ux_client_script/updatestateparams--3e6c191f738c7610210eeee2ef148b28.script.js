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
    var additionalContextToBeUpdated = api.state.additionalContext;
    var uiContext = api.state.uiContext;
    var vaEVAMDefinitionId = '';
    var dataLookUpOutput = api.data.lookup_required_configs_for_nap_1.output || {};
    var isNAPEnabledWithAIEL = dataLookUpOutput.isNAPEnabledWithAIEL ? dataLookUpOutput.isNAPEnabledWithAIEL : false;
    var isIntegratedChatEnabled = dataLookUpOutput.isIntegratedChatEnabled ? dataLookUpOutput.isIntegratedChatEnabled : false;
    if (isNAPEnabledWithAIEL) {
        additionalContextToBeUpdated.sys_deployment_channel_id = dataLookUpOutput.sys_deployment_channel_id;
        vaEVAMDefinitionId = dataLookUpOutput.search_evam_config;
        uiContext.nowAssistDeploymentChannelId = dataLookUpOutput.sys_deployment_channel_id;
    }
    additionalContextToBeUpdated.queryConversationalCatalog = isNAPEnabledWithAIEL.toString();
    additionalContextToBeUpdated.routeConfigId = api.context.props.routeConfigId;
    additionalContextToBeUpdated.workspaceSiteName = api.context.props.searchContext;
    api.setState("additionalContext", additionalContextToBeUpdated);
    api.setState("vaEVAMDefinitionId", vaEVAMDefinitionId);
    api.setState("canAskAFollowUp", isNAPEnabledWithAIEL);
    api.setState("isIntegratedChatEnabled", isIntegratedChatEnabled);
    api.setState("uiContext", uiContext);
}
