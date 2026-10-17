/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { actionConfigurations } = api.context.props.customExpProps;
    const guidanceId = "e8421a2a436f0210f81d92621ab8f2da";
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);

    let listOfActions = [];
    /* Getting actions based on actionConfiguration value */
    let configuredActions = attachArticleGuidanceHelper.getConfiguredGuidanceActions(actionConfigurations,guidanceId,true);
    configuredActions = JSON.parse(JSON.stringify(configuredActions));
    for(let i = 0; i < configuredActions.listOfActions.length; i++){
        let actionId = configuredActions.listOfActions[i].id;
        configuredActions.listOfActions[i].label = api.data.attach_article__translations.output[actionId];
    }
    const configData = api.data.check_user_knowledge_access.output;
    if (configData) {
        const { userHasKbAccess = true, primaryActionByChannel = '' } = configData;
        api.setState('hideLockIcon', userHasKbAccess);
        // Filter actions based on user kb access
        attachArticleGuidanceHelper.filterGuidanceActionsByUserKbAccess(configuredActions.listOfActions, userHasKbAccess);
        // Set primary action based on channel type
        attachArticleGuidanceHelper.updatePrimaryActionByChannel(configuredActions.listOfActions, primaryActionByChannel);
    }
    const { primaryAction, secondaryActions } = attachArticleGuidanceHelper.getPrimaryAndSecondaryActions(configuredActions.listOfActions);
    api.setState('primaryAction', primaryAction);
    api.setState('secondaryActions', secondaryActions);
}
