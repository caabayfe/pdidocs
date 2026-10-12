function transform(input) {
	var result = {};

	result.chat_setup = {};
	var settingsGr = new GlideRecord('sys_cs_live_agent_setup');
	settingsGr.query();
	if (settingsGr.next() && settingsGr.canRead()) {
		var _chatSettings = {
			sys_id: settingsGr.getUniqueValue(),
			readOnly: !settingsGr.canWrite()
		};

		if (_chatSettings.readOnly && !isInSelectedScope(settingsGr)) {
			var expectedScope = settingsGr.getDisplayValue('sys_scope') || 'Global';
			_chatSettings.crossScopeMessage = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.', '<strong>' + expectedScope + '</strong>');
		}

		var isLiveAgentEnabled = settingsGr.getValue('live_agent_enabled');
		_chatSettings['live_agent_enabled'] = {
			value: (isLiveAgentEnabled == "0") ? false : (isLiveAgentEnabled == "1") ? true : isLiveAgentEnabled,
			displayValue: settingsGr.getDisplayValue('live_agent_enabled')
		};

		result.chat_setup = _chatSettings;
	} else {
		// TODO : Domain handling and update error message
		result.chat_setup = {
			error: gs.getMessage('Unable to fetch chat settings. Contact system administrator for details')
		};
	}

	return result;


	function isInSelectedScope(gr) {
		var currentScope = gs.getCurrentScopeName();
		var grScope = gr.getValue('sys_scope');
		return currentScope == grScope;
	}
}
