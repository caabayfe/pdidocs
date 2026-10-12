var AgentChat = Class.create();
AgentChat.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'AgentChat',
    getVersion: function() {
        return sn_cs.AgentChatScriptObject.getVersion();
    }
});
