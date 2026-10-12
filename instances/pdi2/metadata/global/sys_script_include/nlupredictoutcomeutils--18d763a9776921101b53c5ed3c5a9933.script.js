var NluPredictOutcomeUtils = Class.create();
NluPredictOutcomeUtils.prototype = {
    initialize: function() {},

    FAULTED_STATE: "faulted",
    CANCELED_STATE: "canceled",
    CLOSING: "closing",
    SKIPPED_WITH_NEW_UTTERANCE: "skipped_with_new_utterance",
    EXITED_WITH_NO_CONFIRMATION: "exited_with_no_confirmation",
    AI_SEARCH_FALLBACK: "ai_search_fallback",
    SEARCH_CATALOG_REQUESTED_EVENT: "ai_search_catalog_requested",
    SEARCH_RESULT_CLICKED: "ai_search_result_clicked",
    SEARCH_COMPLETED_EVENT: "ai_search_completed",


    updateNluOutcomeOnConversationEnd: function(sys_id, state) {
        var cancelTopic = false;
        var tasks = "";
        var payload = {};

        var messages = new GlideRecord("sys_cs_message");
        messages.addQuery("conversation", sys_id);
        messages.addQuery("direction", 'inbound');
        messages.orderByDesc("sequence");
        messages.query();
        while (messages.next()) {
            if (messages.getValue("payload").contains('cancelTopic')) {
                cancelTopic = true;
            }
            payload[messages.task.toString()] = messages.getValue("payload");
        }

        var tasksGr = new GlideRecord("sys_cs_conversation_task");
        tasksGr.query("conversation", sys_id);
        while (tasksGr.next()) {
            tasks = tasks + "," + tasksGr.getValue("sys_id");
        }

        this.updateNLUOutcome(tasks, cancelTopic, state, sys_id, payload);
    },

    updateNLUOutcome: function(tasks, cancelTopic, state, sys_id, payload) {
        var closeUtterance, utterance, lastUtterance, task;
        var closeConversation = false;
        var typedNewUtterance = false;
        var closingOutcomeUpdated = false;
        var aiSearchFallbackUtterances = [];
        var events = this.getAISearchFallbackEvents(sys_id);
        var topicId = sn_cs.VASystemObject.getContextProfileParamsForConversationId(sys_id, this.CLOSING);

        var open_nlu_predict_intent_feedback_gr = new GlideRecord("open_nlu_predict_intent_feedback");
        open_nlu_predict_intent_feedback_gr.addQuery("app_document", 'IN', tasks);
        open_nlu_predict_intent_feedback_gr.orderByDesc("sys_created_on");
        open_nlu_predict_intent_feedback_gr.query();

        while (open_nlu_predict_intent_feedback_gr.next()) {
            utterance = open_nlu_predict_intent_feedback_gr.getValue("utterance");
            task = open_nlu_predict_intent_feedback_gr.getValue("app_document");

            if (typedNewUtterance) {
                open_nlu_predict_intent_feedback_gr.setValue("nlu_discovery_outcome", this.SKIPPED_WITH_NEW_UTTERANCE);
                open_nlu_predict_intent_feedback_gr.update();
                typedNewUtterance = false;
            }

            typedNewUtterance = payload[task] && JSON.parse(payload[task])["searchText"] != null && JSON.parse(payload[task])["uiType"] == "Picker";

            if (open_nlu_predict_intent_feedback_gr.getValue("topic_switched") == topicId) {
                closeConversation = true;
                closeUtterance = utterance;
            }

            if ((cancelTopic || state === this.FAULTED_STATE || state === this.CANCELED_STATE) && !lastUtterance) {
                lastUtterance = {
                    "utterance": utterance,
                    "task": task
                };
            }

            if (!closingOutcomeUpdated && closeConversation && (utterance !== closeUtterance)) {
                open_nlu_predict_intent_feedback_gr.setValue("nlu_discovery_outcome", this.EXITED_WITH_NO_CONFIRMATION);
                open_nlu_predict_intent_feedback_gr.update();
                closingOutcomeUpdated = true;
            }

            if (events["idToUtteranceMap"] && events["idToUtteranceMap"][utterance]) {
                var searchId = events["idToUtteranceMap"][utterance];
                var eventMetrics = events[searchId] && events[searchId]["metrics"];
                // Priority of events to log.
                if (eventMetrics.indexOf("SEARCH_CATALOG_REQUESTED_EVENT") !== -1) {
                    aiSearchFallbackUtterances.push(utterance);
                    this.updateNluDiscoveryOutcome(open_nlu_predict_intent_feedback_gr, this.SEARCH_CATALOG_REQUESTED_EVENT);
                } else if (eventMetrics.indexOf("SEARCH_RESULT_CLICKED") !== -1) {
                    aiSearchFallbackUtterances.push(utterance);
                    this.updateNluDiscoveryOutcome(open_nlu_predict_intent_feedback_gr, this.SEARCH_RESULT_CLICKED);
                } else if (eventMetrics.indexOf("SEARCH_COMPLETED_EVENT") !== -1) {
                    aiSearchFallbackUtterances.push(utterance);
                    this.updateNluDiscoveryOutcome(open_nlu_predict_intent_feedback_gr, this.SEARCH_COMPLETED_EVENT);
                } else if (eventMetrics.indexOf("SEARCH_RESULT_DISPLAYED") !== -1) {
                    aiSearchFallbackUtterances.push(utterance);
                    this.updateNluDiscoveryOutcome(open_nlu_predict_intent_feedback_gr, this.AI_SEARCH_FALLBACK);
                }
            }
        }

        if ((cancelTopic && !closeConversation) || state === this.FAULTED_STATE || state === this.CANCELED_STATE) {
            if (aiSearchFallbackUtterances.indexOf(lastUtterance.utterance) === -1) {
                this.updateOutcomeWithNoConfirmation(lastUtterance);
            }
        }
    },

    updateNluDiscoveryOutcome: function(gr, value) {
        gr.setValue("nlu_discovery_outcome", value);
        gr.update();
    },

    updateOutcomeWithNoConfirmation: function(lastUtterance) {
        var nlu_predict_intent_feedback_gr = new GlideRecord("open_nlu_predict_intent_feedback");
        nlu_predict_intent_feedback_gr.addQuery("app_document", lastUtterance.task);
        nlu_predict_intent_feedback_gr.addQuery("utterance", lastUtterance.utterance);
        nlu_predict_intent_feedback_gr.query();
        if (nlu_predict_intent_feedback_gr.next()) {
            this.updateNluDiscoveryOutcome(nlu_predict_intent_feedback_gr, this.EXITED_WITH_NO_CONFIRMATION);
        }
    },

    getAISearchFallbackEvents: function(conversationId) {
        var events = {};
        var analytics = new GlideRecord("sys_ci_analytics");
        analytics.addQuery("conversation", conversationId);
        analytics.addQuery("metric", "!=", "");
        analytics.query();

        while (analytics.next()) {
            var metrics = analytics.getValue("metric");
            var metricsJSON = JSON.parse(metrics);
            var searchId = metricsJSON["Search Id"];
            var eventName = metricsJSON["Name"];

            if (events[searchId] == null) {
                events[searchId] = {
                    "metrics": [eventName]
                };
            } else {
                events[searchId]["metrics"].push(eventName);
            }
            if ("SEARCH_TRIGGERED" === eventName) {
                events["idToUtteranceMap"] = events["idToUtteranceMap"] == null ? {} : events["idToUtteranceMap"];
                var searchTerm = metricsJSON["Search Term"];
                events["idToUtteranceMap"][searchTerm] = searchId;
                events[searchId]["searchTerm"] = metricsJSON["Search Term"];
                events[searchId]["taskId"] = analytics.getValue("document_id");
            }
        }
        return events;
    },

    type: 'NluPredictOutcomeUtils'
};
