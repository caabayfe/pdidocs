function transform(input) {

    var result = {};

    // Live agent settings
    result.chat_setup = {};
    var settingsGr = new GlideRecord('sys_cs_live_agent_setup');
    settingsGr.query();
    if (settingsGr.next() && settingsGr.canRead()) {
        var _chatSettings = {
            sys_id: settingsGr.getUniqueValue(),
            readOnly: !settingsGr.canWrite()
        };

        if (_chatSettings.readOnly && !settingsGr.isInSelectedScope()) {
            _chatSettings.crossScopeMessage = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.',
                '<strong>' + settingsGr.getTableScopeName() + '</strong>');
        }

        var _reqColumns = ['name', 'show_agent_details', 'show_agent_name_in_header', 'live_agent_enabled', 'allow_transcript_download', 'wait_status', 'agent_whisper', 'transfer_message', 'no_agent_available_message', 'emoji_enabled'];
        _reqColumns.forEach(function(_column) {
            var _value = settingsGr.getValue(_column);
            _chatSettings[_column] = {
                value: (_value == "0") ? false : (_value == "1") ? true : _value,
                displayValue: settingsGr.getDisplayValue(_column)
            };
        });

        // autopilot_client_messages_enabled - This column is added in 'Glide Virtual Agent'(com.glide.cs.chatbot) plugin
        if (GlidePluginManager.isActive('com.glide.cs.chatbot')) {
            var _autoPilotColumn = 'autopilot_client_messages_enabled';
            var _value = settingsGr.getValue(_autoPilotColumn);
            _chatSettings[_autoPilotColumn] = {
                value: (_value == "0") ? false : (_value == "1") ? true : _value,
                displayValue: settingsGr.getDisplayValue(_autoPilotColumn)
            };
        }

        result.chat_setup = _chatSettings;

        //Connect Plugin Detection
        if (GlidePluginManager.isActive('com.glide.connect.support')) {
            result.showLegacyConnect = true;
            result.connectLink = {
                label: gs.getMessage('Connect Support settings (previously Chat Setup)'),
                url: '/nav_to.do?uri=%2Fsys_cs_live_agent_setup.do%3Fsys_id%3D'
            };
        }

    } else {
        // TODO : Domain handling and update error message
        result.chat_setup = {
            error: gs.getMessage("Unable to fetch chat settings. Contact system administrator for details")
        };
    }

    // Profanity detection plugin
    result.isProfanityFilterInstalled = GlidePluginManager.isActive('com.sn.va.profanity');
    if (result.isProfanityFilterInstalled) {
        var flaggedWordsGR = new GlideAggregate("sys_cs_profane_word");
		if (flaggedWordsGR.isValid()) {
			flaggedWordsGR.addAggregate('COUNT');
			flaggedWordsGR.query();
			var _count = flaggedWordsGR.next() ? flaggedWordsGR.getAggregate('COUNT') : 0;
			result.profanityFlaggedWordsText = gs.getMessage("Flagged words ({0})", _count);			
		}
    } else {
        // TODO: Maintain a central store (protected script include atleast) for all plugin related links used in admin console
        result.profanityFilterAppLink = "https://store.servicenow.com/sn_appstore_store.do#!/store/application/77d07c3b7352201076d81f8afaf6a7bb";
    }

    // Workspace Quick Actions 
    if (GlidePluginManager.isActive('com.glide.quickactions')) {
        var actionsGr = new GlideRecord('quickactions_workspace_action');
        result.quickActionsAvailable = actionsGr.isValid() && actionsGr.canRead();
        if (result.quickActionsAvailable) {
            var actionssGR = new GlideAggregate("quickactions_workspace_action");
            actionssGR.addAggregate('COUNT');
            actionssGR.query();
            var actionsCount = actionssGR.next() ? actionssGR.getAggregate('COUNT') : 0;
            result.quickActionsText = gs.getMessage("Quick actions ({0})", actionsCount);
        }
    }

    return result;
}
