var UXKeyboardShortcutAIRecommender = Class.create();
UXKeyboardShortcutAIRecommender.prototype = {
    AI_PLUGIN_ID: 'com.now_keyboard_shortcuts_ai_skills',
    CAPABILITY_ID: 'b56604a1ff3b7210811effffffffff5f',
    SKILL_CONFIG_ID: '526644a1ff3b7210811effffffffffd4',

    initialize: function() {},

    recommend: function(inputShortcut, platform, count, shortcutName) {
        var suggestionsMode = gs.getProperty('glide.uxf.lib.sn_workspace_kbs_suggestions', 'on').toLowerCase();
        gs.info('KBS: suggestionsMode: ' + suggestionsMode);
        var isAiPluginActive = GlidePluginManager.isActive(this.AI_PLUGIN_ID);

        switch (suggestionsMode) {
            case 'llm-only':
                if (!isAiPluginActive) {
                    //KBS: llm-only mode set but AI plugin is inactive. No recommendations.
                    return {};
                }
                //KBS: llm-only mode set. Returning AI recommendations.
                return this._recommendWithAI(inputShortcut, platform, shortcutName);

            case 'llm-off':
                //KBS: llm-off mode set. Returning fallback recommendations.
                return this._recommendWithFallback(inputShortcut, platform, count);

            case 'on':
            default:
                if (isAiPluginActive) {
                    //KBS: recommendation mode is on and AI plugin is active. Returning AI recommendations.
                    return this._recommendWithAI(inputShortcut, platform, shortcutName);
                }
                //KBS: recommendation mode is on but AI plugin is inactive. Returning fallback recommendations.
                return this._recommendWithFallback(inputShortcut, platform, count);
        }
    },

    _recommendWithAI: function(inputShortcut, platform, shortcutName) {
        var aiResult = this._recommendWithOneExtend(inputShortcut, platform, shortcutName);
        if (aiResult && typeof aiResult === 'object') {
            aiResult.source = 'llm';
        }
        return aiResult;
    },

    _recommendWithFallback: function(inputShortcut, platform, count) {
        var result = new global.UXKeyboardShortcutRecommender().recommend(inputShortcut, platform, count);
        if (result && typeof result === 'object') {
            result.source = 'default';
        }
        return result;
    },

    _recommendWithOneExtend: function(inputShortcut, platform, shortcutName) {
        var shortcut = typeof inputShortcut === 'string' ? JSON.parse(inputShortcut) : inputShortcut;
        var request = {
            mode: 'sync',
            timeout: 240,
            executionRequests: [{
                meta: {
                    skillConfigId: this.SKILL_CONFIG_ID
                },
                payload: {
                    allKeyCombos: JSON.stringify(this._getAllKeyCombos()),
                    newKeyCombo: JSON.stringify(shortcut[platform]),
                    platform: platform,
                    language: gs.getSession().getLanguage(),
                    keyboardShortcutName: shortcutName || '',
                },
                capabilityId: this.CAPABILITY_ID,
                returnRequest: true,
            }],
        };

        try {
            var response = sn_one_extend.OneExtendUtil.execute(request);
            return this._extractAIResponse(response);
        } catch (e) {
            gs.info('Error getting GenAI keyboard shortcut recommendations');
        }
        return this._recommendWithFallback(inputShortcut, platform, 2);
    },

    _extractAIResponse: function(oneExtendResponse) {
        var capabilityResponse = oneExtendResponse.capabilities[this.CAPABILITY_ID];
        var json = JSON.parse(capabilityResponse.response);
        if (json.model_output && json.model_output.length > 0) {
            try {
                json = JSON.parse(json.model_output);
                json.recommendation = json.recommendation.map((object) => {
                    if(!(json.platform in object)) {
                        return {
                            [json.platform]: {...object}
                        };
                    }
                    return {...object};
                });
            } catch (e) {
                gs.info('Error parsing model_output: ' + e);
            }
        }
        return json;
    },

    _getAllKeyCombos: function() {
        var results = [];
        var tables = ['sys_ux_keyboard_shortcut', 'sys_ux_keyboard_shortcut_deny_list'];

        for (var t = 0; t < tables.length; t++) {
            var gr = new GlideRecord(tables[t]);
            gr.addQuery('active', true);
            gr.query();
            while (gr.next()) {
                var rawShortcut = gr.getValue('shortcut');
                if (rawShortcut) {
                    try {
                        results.push(JSON.parse(rawShortcut));
                    } catch (e) {
                        // ignore malformed shortcut JSON
                    }
                }
            }
        }

        return results;
    },

    type: 'UXKeyboardShortcutAIRecommender',
};
