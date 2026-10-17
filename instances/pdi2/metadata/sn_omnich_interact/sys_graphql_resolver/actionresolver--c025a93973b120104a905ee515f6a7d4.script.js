(function process(env) {
    let enableHelp = false;

    const {
        table: tableName,
        sysId
    } = env.getArguments();
    const {
        CAPABILITIES,
        QUICK_ACTIONS,
        INTERACTION,
        SYS_CS_LIVE_AGENT_SETUP
    } = sn_omnich_interact.ThirdPartyChatConstants;
    const {
        THIRD_PARTY_INTEGRATION,
        HELP_REQUESTED,
        AUTO_PILOT,
        PRIVATE_CHAT
    } = CAPABILITIES;

    const actionMap = {
        [QUICK_ACTIONS.HELP_REQUESTED]: HELP_REQUESTED,
        [QUICK_ACTIONS.AUTO_PILOT]: AUTO_PILOT
    };

    const liveAgentSetup = SYS_CS_LIVE_AGENT_SETUP;
    const gr = new GlideRecord(liveAgentSetup.TABLE);

    if (
        gr.get(liveAgentSetup.CHAT_SETUP) &&
        gr.getValue(liveAgentSetup.AGENT_WHISPER) === liveAgentSetup.AGENT_WHISPER_ENABLED
    ) {
        enableHelp = true;
    }

    if (INTERACTION.TABLE === tableName) {
        const cafLAUtils = new global.CAFLiveAgentUtils();
        const providerApplication = cafLAUtils.getProviderApplicationFromInteraction(sysId);

        if (providerApplication) {
            const filters = cafLAUtils.fetchCapabilityValue(providerApplication, [
                HELP_REQUESTED, AUTO_PILOT, THIRD_PARTY_INTEGRATION, PRIVATE_CHAT
            ]);

            if (!filters.hasOwnProperty(THIRD_PARTY_INTEGRATION) || filters[THIRD_PARTY_INTEGRATION] !== "true") {
                return filterActions(
                    sn_snippets.QuickAction.loadActions(tableName, sysId),
                    enableHelp
                );
            }

            enableHelp = filters[THIRD_PARTY_INTEGRATION] === "true" && filters[PRIVATE_CHAT] === "true" && filters[HELP_REQUESTED] === "true";

            if (filters[THIRD_PARTY_INTEGRATION] === "true") {
                return filterActions(sn_snippets.QuickAction.loadActions(tableName, sysId), enableHelp, actionMap, filters);
            }
        }
    }

    return filterActions(sn_snippets.QuickAction.loadActions(tableName, sysId), enableHelp);
})(env);


function filterActions(actions, enableHelp, actionMap = {}, filters = {}) {
    if (!actions) {
        return [];
    }

    var filteredActions = JSON.parse(actions)
        .filter(item => !(item.sysId in actionMap && filters[actionMap[item.sysId]] !== "true"));

    if (!enableHelp) {
        return filteredActions.filter(item => item.sysId !== sn_omnich_interact.ThirdPartyChatConstants.QUICK_ACTIONS.HELP_REQUESTED);
    }

    return filteredActions;
}
