var AgentChatDynamicTranslationUtil = Class.create();
AgentChatDynamicTranslationUtil.prototype = {
    initialize: function() {},

    getConversationModelType: function(conversationSysId) {
        var convGr = new GlideRecord('sys_cs_conversation');
        if (convGr.get(conversationSysId)) {
            return convGr.getValue('model_type');
        }
        return '';
    },

    type: 'AgentChatDynamicTranslationUtil'
};
