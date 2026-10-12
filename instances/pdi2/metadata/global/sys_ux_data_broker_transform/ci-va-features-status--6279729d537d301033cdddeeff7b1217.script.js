function transform(input) {

    var result = {
        topicRecommendationsInstalled: false,
        deflectionTrackingEnabled: false,
        vaAnalyticsInstalled: false,
        chatSettings: {},
        iarSettings: {},
        nluSettings: {}
    };

    // VA Topic Recommendations store app
    result.topicRecommendationsInstalled = GlidePluginManager.isActive("com.snc.va_topic_recommender");
    var trSettingsGr = new GlideAggregate("sn_topic_recommend_default_setting");
    if (result.topicRecommendationsInstalled && trSettingsGr.isValid()) {
        trSettingsGr.addAggregate('COUNT');
        trSettingsGr.query();
        var trSettingsCount = trSettingsGr.next() ? trSettingsGr.getAggregate('COUNT') : 0;
        result.trDefaultSettingsText = gs.getMessage("Default criteria ({0})", trSettingsCount);
    }


    // Deflection Tracking Enabled
    result.deflectionTrackingEnabled = (gs.getProperty("com.glide.cs.va.deflection_tracking.enable") === "true");
    var dfConfigGR = new GlideAggregate("ssa_deflection_configuration");
    if (result.deflectionTrackingEnabled && dfConfigGR.isValid()) {
        dfConfigGR.addEncodedQuery("activity_context=7b43fb645383201033cdddeeff7b1246");
        dfConfigGR.addAggregate('COUNT');
        dfConfigGR.query();
        var dfConfigCount = dfConfigGR.next() ? dfConfigGR.getAggregate('COUNT') : 0;
        result.deflectionConfigText = gs.getMessage("Deflection configurations ({0})", dfConfigCount);
    }


    // Conversational Analytics Dashboard store app
    result.vaAnalyticsInstalled = GlidePluginManager.isActive("sn_ci_analytics");


    // Issue Auto-Resolution 
    result.iarSettings = (function() {
        var _iarSetttings = {};
        var _iarInstalled = GlidePluginManager.isActive("com.glide.cs.auto_resolution");
        if (_iarInstalled) {
            var _isIarEnabled = gs.getProperty("com.glide.cs.enable_auto_resolution") === "true";
            var gr = new GlideRecordSecure("sys_cs_auto_resolution_configuration");
            if (_isIarEnabled && gr.isValid()) {
                gr.addActiveQuery();
                gr.query();
                _isIarEnabled = gr.hasNext();
            }
            var iarSimulationGR = new GlideAggregate("sys_cs_auto_resolution_simulation_configuration");
            if (iarSimulationGR.isValid()) {
                iarSimulationGR.addAggregate('COUNT');
                iarSimulationGR.query();
                var _simulationCount = iarSimulationGR.next() ? iarSimulationGR.getAggregate('COUNT') : 0;

                _iarSetttings.simulationsText = gs.getMessage("Simulations ({0})", _simulationCount);
            }
            _iarSetttings.enabled = _isIarEnabled;
        }
        _iarSetttings.installed = _iarInstalled;
        return _iarSetttings;
    })();


    // NLU settings enabled
    result.nluSettings = (function() {
        var _nluSettings = {};
        var csSettingsGR = new GlideRecordSecure("sys_cs_general_settings");
        if (csSettingsGR.isValid()) {
            csSettingsGR.query();
            if (csSettingsGR.next()) {
                _nluSettings.sysId = csSettingsGR.getUniqueValue();
                _nluSettings.enabled = csSettingsGR.getValue('nlu_enabled') == 1;
            }
        }
        return _nluSettings;
    })();


    // Chat settings - VA Notifications Enabled
    result.chatSettings = (function() {
        var _chatSettings = {};
        var laGR = new GlideRecordSecure("sys_cs_live_agent_setup");
        if (laGR.isValid()) {
            laGR.query();
            if (laGR.next()) {
                _chatSettings.sysId = laGR.getUniqueValue();
                _chatSettings.notificationsEnabled = laGR.getValue('notification_enabled') == 1;
                _chatSettings.readOnly = !laGR.canWrite();
                if (_chatSettings.readOnly && !laGR.isInSelectedScope()) {
                    _chatSettings.infoMsg = gs.getMessage('Notification settings can only be edited when {0} is the current application. Change the scope to make any updates.', laGR.getTableScopeName());
                }
            }
        }
        return _chatSettings;
    })();


    // Custom Greetings and Setup
    result.customGreetingsCountText = (function() {
        var ctxProfileGR = new GlideAggregate("sys_cs_context_profile");
        var _count = 0;
        if (ctxProfileGR.isValid()) {
            ctxProfileGR.addAggregate('COUNT');
            ctxProfileGR.query();
            _count = ctxProfileGR.next() ? ctxProfileGR.getAggregate('COUNT') : 0;
        }
        return gs.getMessage("Custom Greetings and Setup ({0})", _count);
    })();

    return result;
}
