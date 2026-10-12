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
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);
    const { guidanceId, actionConfigurations } = api.context.props;
    let listOfActions = [];
    let actionConfigurationProperty = actionConfigurations;

    /* Getting listOfActions based on actionConfigurationProperty value */
    var actions = attachArticleGuidanceHelper.getConfiguredGuidanceActions(actionConfigurationProperty,guidanceId,false);
    listOfActions = actions.listOfActions;
    /* If the actionConfigurationProperty json is not valid, set the default listOfActions from state */
    if(!listOfActions){
        listOfActions = api.state.detailViewActions.listOfActions;
    }

    /* Taking translations from the data-broker. If any new translations get added here, please make sure to keep the action id same with the databroker output translated action id.*/
    for (let i = 0; i < listOfActions.length; i++) {
        let actionId = listOfActions[i].id;
        listOfActions[i].label = api.data.attach_article__translations.output[actionId];
    }

    const configData = api.data.check_user_knowledge_access.output;
    if (configData) {
        const { userHasKbAccess = true, primaryActionByChannel = '' } = configData;
        api.setState('hideLockIcon', userHasKbAccess);
        // Filter actions based on user kb access
        attachArticleGuidanceHelper.filterGuidanceActionsByUserKbAccess(listOfActions, userHasKbAccess);
        // Set primary action based on channel type
        attachArticleGuidanceHelper.updatePrimaryActionByChannel(listOfActions, primaryActionByChannel);
    }
    let translatedDetailActions = {
        listOfActions: listOfActions
    };
    api.setState('detailViewActions', translatedDetailActions);
    const showFlag = api.data.get_knowledge_record_details_1.articleDetails ? api.data.get_knowledge_record_details_1.articleDetails.showFlag : false;
    const { primaryAction, secondaryActions } = attachArticleGuidanceHelper.getPrimaryAndSecondaryActions(listOfActions, true, showFlag);
    api.setState('primaryAction', primaryAction);
    api.setState('secondaryActions', secondaryActions);
}
