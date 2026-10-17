var CsContextProfile = Class.create();
CsContextProfile.prototype = {
    initialize: function() {},

    _createGr: function() {
        var modelType = current.context_profile.model_type;
        // context profile with nowassistpanel model_type should also have access to all LLM topics
        if (modelType == "nowassistpanel") {
            modelType = "llm";
        }
        var gr = new GlideRecord("sys_cs_topic");
        gr.addActiveQuery();
        gr.addQuery("published", true);
        gr.addQuery("library", "").addOrCondition("library", false);
        // only show topics that match the same model type as the context profile's model type
        var grOr = gr.addQuery("model_type", modelType);
        // older nlu/keyword context profiles and topics may not have model_type set
        if (modelType == "nlu_keyword" || modelType == "") {
            grOr.addOrCondition("model_type", "");
            grOr.addOrCondition("model_type", "nlu_keyword");
        }
        return gr;
    },

    _runQueryAndReturnEncodedQuery: function(gr) {
        var sysIds = [];
        gr.query();
        while (gr.next()) {
            sysIds.push(gr.getValue("sys_id"));
        }
        return 'sys_idIN' + sysIds.join(",");
    },

    // a filter function meant to be used by sys_cs_context_profile_topic.topic's reference_qual
    // only certain topics should be selectable, including a filter for matching model_type
    filterSetupTopics: function() {
        var gr = this._createGr();
        gr.addQuery("design_category", "5628e7f27373230025d032e954f6a7de").addOrCondition("type", "SETUP_TOPIC");
        return this._runQueryAndReturnEncodedQuery(gr);
    },

    // a filter function meant to be used by sys_cs_context_profile_promotion.topic's reference_qual
    // only certain topics should be selectable, including a filter for matching model_type
    filterPromotedTopics: function() {
        var gr = this._createGr();
        gr.addQuery("is_system_topic", "").addOrCondition("is_system_topic", false);
        gr.addQuery("visible", true);
        return this._runQueryAndReturnEncodedQuery(gr);
    },

    // filter on sys_cs_context_profile_skill.context_profile selection
    filterProfileSkillMapping: function() {
        var gr = new GlideRecord("sys_cs_context_profile");
        gr.addEncodedQuery("assistant_applicability_typeINprofile,group");
        return this._runQueryAndReturnEncodedQuery(gr);
    },

    type: 'CsContextProfile'
};
