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
    const {
        guidanceId,
        actionConfigurations
    } = api.context.props;
    let listOfActions = [];
    let actionConfigurationProperty = actionConfigurations;

    const ACTION_ATTACH_ARTICLE_EMAIL = "attach-article-email";
    const ACTION_ADD_LINK_MESSAGE = "add-link-message";
    const ACTION_READ_FULL_ARTICLE = "read-full-article";

    const INTERACTION_CHAT = "chat";
    const INTERACTION_PHONE = "phone";
    const INTERACTION_EMAIL = "email";
    const INTERACTION_MESSAGING = "messaging";

    /* Getting listOfActions based on actionConfigurationProperty value */
    let actions = attachArticleGuidanceHelper.getConfiguredGuidanceActions(actionConfigurationProperty, guidanceId, false);
    listOfActions = actions.listOfActions;
    /* If the actionConfigurationProperty json is not valid, set the default listOfActions from state */
    if (!listOfActions) {
        listOfActions = api.state.detailViewActions.listOfActions;
    }

    let translatedDetailActions = {
        listOfActions: listOfActions
    };

    const configData = api.data.check_chat_session_and_user_kb_access_detail.output;
    const interactionType = configData && configData.interactionType ? configData.interactionType : '';

    if (configData) {
        if (!configData.userHasKbAccess) {
            api.setState('hideLockIcon', false);
        } else {
            api.setState('hideLockIcon', true);
        }
        translatedDetailActions.listOfActions = attachArticleGuidanceHelper.filterGuidanceActionsBySessionAndAccess(translatedDetailActions.listOfActions, configData);
    }

    /* Taking translations from the data-broker. If any new translations get added here, please make sure to keep the action id same with the databroker output translated action id.*/
    for (let i = 0; i < listOfActions.length; i++) {
        let actionId = listOfActions[i].id;
        listOfActions[i].label = api.data.attach_article__translations.output[actionId];

        /* Hide specific actions based on interaction type and user permissions.*/
        if (interactionType !== INTERACTION_PHONE && interactionType !== INTERACTION_EMAIL && interactionType !== INTERACTION_MESSAGING) {
            if (actionId === ACTION_ADD_LINK_MESSAGE || actionId === ACTION_ATTACH_ARTICLE_EMAIL) {
                listOfActions[i].hideAction = true;
            }
        } else {
            if (interactionType === INTERACTION_PHONE) {
                if (actionId === ACTION_ADD_LINK_MESSAGE && (!configData.userHasKbAccess || !configData.checkConvSmsServPluginInstalled)) {
                    listOfActions[i].hideAction = true;
                }
                if(actionId === ACTION_ATTACH_ARTICLE_EMAIL) {
                    listOfActions[i].hideAction = true;
                }
            }
            if(interactionType === INTERACTION_EMAIL) {
               if (actionId === ACTION_ADD_LINK_MESSAGE || (actionId === ACTION_ATTACH_ARTICLE_EMAIL && !configData.userHasKbAccess)) {
                    listOfActions[i].hideAction = true;
               }
            }
            if(interactionType === INTERACTION_MESSAGING) {
               if ((actionId === ACTION_ADD_LINK_MESSAGE && (!configData.userHasKbAccess || !configData.checkConvSmsServPluginInstalled)) || actionId === ACTION_ATTACH_ARTICLE_EMAIL) {
                    listOfActions[i].hideAction = true;
               }
            }
        }
    }

    api.setState('detailViewActions', translatedDetailActions);
    const showFlag = api.data.get_knowledge_record_details_1.articleDetails ? api.data.get_knowledge_record_details_1.articleDetails.showFlag : false;
    const {
        primaryAction,
        secondaryActions
    } = attachArticleGuidanceHelper.getPrimaryAndSecondaryActions(translatedDetailActions.listOfActions, true, showFlag);
    api.setState('primaryAction', primaryAction);
    api.setState('secondaryActions', secondaryActions);
}
