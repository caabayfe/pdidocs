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
    const {
        actionConfigurations
    } = api.context.props.customExpProps;
    const guidanceId = "550918d9439412102280698f38b8f26a";
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);

    const ACTION_ATTACH_ARTICLE_EMAIL = "attach-article-email";
    const ACTION_ADD_LINK_MESSAGE = "add-link-message";
    const ACTION_READ_FULL_ARTICLE = "read-full-article";

    const INTERACTION_CHAT = "chat";
    const INTERACTION_PHONE = "phone";
    const INTERACTION_EMAIL = "email";
    const INTERACTION_MESSAGING = "messaging";
    let listOfActions = [];

    /* Getting actions based on actionConfiguration value */
    let configuredActions = attachArticleGuidanceHelper.getConfiguredGuidanceActions(actionConfigurations, guidanceId, true);
    configuredActions = JSON.parse(JSON.stringify(configuredActions));
    const configData = api.data.check_chat_session_and_user_kb_access.output;
    const interactionType = configData && configData.interactionType ? configData.interactionType : '';

    if (configData) {
        if (!configData.userHasKbAccess) {
            api.setState('hideLockIcon', false);
        } else {
            api.setState('hideLockIcon', true);
        }
        configuredActions.listOfActions = attachArticleGuidanceHelper.filterGuidanceActionsBySessionAndAccess(configuredActions.listOfActions, configData);
    }

    for (let i = 0; i < configuredActions.listOfActions.length; i++) {
        let actionId = configuredActions.listOfActions[i].id;
        configuredActions.listOfActions[i].label = api.data.attach_article__translations.output[actionId];
        /* Hide specific actions based on interaction type and user permissions.*/
        if (interactionType !== INTERACTION_PHONE && interactionType !== INTERACTION_EMAIL && interactionType !== INTERACTION_MESSAGING) {
            if (actionId === ACTION_ADD_LINK_MESSAGE || actionId === ACTION_ATTACH_ARTICLE_EMAIL) {
                configuredActions.listOfActions[i].hideAction = true;
            }
        } else {
            if (interactionType === INTERACTION_PHONE) {
                if (actionId === ACTION_ADD_LINK_MESSAGE && (!configData.userHasKbAccess || !configData.checkConvSmsServPluginInstalled)) {
                    configuredActions.listOfActions[i].hideAction = true;
                }
                if(actionId === ACTION_ATTACH_ARTICLE_EMAIL) {
                    configuredActions.listOfActions[i].hideAction = true;
                }
            }
            if(interactionType === INTERACTION_EMAIL) {
               if (actionId === ACTION_ADD_LINK_MESSAGE || (actionId === ACTION_ATTACH_ARTICLE_EMAIL && !configData.userHasKbAccess)) {
                    configuredActions.listOfActions[i].hideAction = true;
               }
            }
            if(interactionType === INTERACTION_MESSAGING) {
               if ((actionId === ACTION_ADD_LINK_MESSAGE && (!configData.userHasKbAccess || !configData.checkConvSmsServPluginInstalled)) || actionId === ACTION_ATTACH_ARTICLE_EMAIL) {
                    configuredActions.listOfActions[i].hideAction = true;
               }
            }
        }
    }

    //api.setState("actions", configuredActions); //commenting since it's no where getting used & unnecessarily mutating the state of the followed by macroponent occurrences

    let {
        primaryAction,
        secondaryActions
    } = attachArticleGuidanceHelper.getPrimaryAndSecondaryActions(configuredActions.listOfActions);

    /* Set the Read article as primary action when the user doesn't have kb access and move the current primary to secondary actions.*/
    if((interactionType === INTERACTION_EMAIL || interactionType === INTERACTION_PHONE || interactionType === INTERACTION_MESSAGING) && !configData.userHasKbAccess) {
        secondaryActions.push(primaryAction);
        primaryAction = secondaryActions.find(action => action.id === ACTION_READ_FULL_ARTICLE);
        secondaryActions = secondaryActions.filter(action => action.id !== ACTION_READ_FULL_ARTICLE);
    }    
    api.setState('primaryAction', primaryAction);
    api.setState('secondaryActions', secondaryActions);
}
