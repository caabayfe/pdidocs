var SentimentUtil = Class.create();
SentimentUtil.prototype = {
    initialize: function() {},

    updateConversationSentiment: function(conversationId, sentimentScore, sentiment) {
        var gr = new GlideRecord('sys_cs_conversation');
        gr.addQuery('sys_id', conversationId);
        gr.query();
        if (gr.next()) {
            gr.setValue('sentiment_normalized', sentimentScore);
            gr.setValue('sentiment', sentiment);
            gr.update();
        }
        this._updateInteractionSentiment(conversationId, sentimentScore);
    },

    updateMessageSentiment: function(key, sentimentScore, sentiment) {
        var gr = new GlideRecord('sys_cs_message');
        gr.addQuery('sys_id', key);
        gr.query();
        if (gr.next()) {
            gr.setValue('sentiment_normalized', sentimentScore);
            gr.setValue('sentiment', sentiment);
            gr.update();
        }
    },

    _updateInteractionSentiment: function(conversationId, sentiment) {
        var gr = new GlideRecord('interaction');
        gr.addQuery('channel_metadata_document', conversationId);
        gr.addQuery('channel_metadata_table', 'sys_cs_conversation');
        gr.query();
        if (gr.next()) {
            gr.setValue('sentiment', sentiment);
            gr.update();
        }
    },

    createInteractionInsight: function(conversationId, interactionId, agent) {
        var agentSentiment = this._calculateAggregateSentimentForAgent(conversationId, agent);
        if (agentSentiment) {
            var interactionInsightGr = new GlideRecord('sys_cs_interaction_insight');
            interactionInsightGr.addQuery('interaction', interactionId);
            interactionInsightGr.addQuery('user', agent);
            interactionInsightGr.query();
            if (interactionInsightGr.next()) {
                interactionInsightGr.setValue('sentiment_normalized', agentSentiment.score);
                interactionInsightGr.setValue('sentiment', agentSentiment.sentiment);
                interactionInsightGr.update();
            } else {
                interactionInsightGr.initialize();
                interactionInsightGr.setValue('interaction', interactionId);
                interactionInsightGr.setValue('user', agent);
                interactionInsightGr.setValue('sentiment_normalized', agentSentiment.score);
                interactionInsightGr.setValue('sentiment', agentSentiment.sentiment);
                interactionInsightGr.setValue('type', 'sentiment');
                interactionInsightGr.setValue('user_type', 'agent');
                interactionInsightGr.insert();
            }
        }
    },

    _calculateAggregateSentimentForAgent: function(conversationId, recipient) {
        var messageGr = new GlideAggregate('sys_cs_message');
        messageGr.setGroup(false);
        messageGr.addQuery('conversation', conversationId);
        messageGr.addQuery('recipient', recipient);
        messageGr.addEncodedQuery("sentimentISNOTEMPTY");
        messageGr.addAggregate('AVG', 'sentiment_normalized');
        messageGr.query();

        if (messageGr.next() && recipient) {
            var conversationScore = messageGr.getAggregate('AVG', 'sentiment_normalized');
            var sentimentObject = sn_cs.VASystemObject.getSentimentNormalisedScore(1, conversationScore);
            if (sentimentObject) {
                return JSON.parse(sentimentObject);
            }
        }
        return null;
    },

    getInteractionAssignedToAndId: function(conversationId) {
        var interactionGr = new GlideRecord('interaction');
        interactionGr.query('channel_metadata_document', conversationId);
        if (interactionGr.next()) {
            return {
                "interactionId": interactionGr.getUniqueValue(),
                "agent": interactionGr.getValue('assigned_to')
            };
        }
    },

    type: 'SentimentUtil'
};
