(function calc(convGr) {
    var conversationId = convGr.getValue('sys_id');
    var interactionGr = new GlideRecord('interaction');
    interactionGr.addQuery('channel_metadata_document', conversationId);
    interactionGr.addQuery('channel_metadata_table', 'sys_cs_conversation');
    interactionGr.query();
    if (interactionGr.next()) {
        var state = interactionGr.getValue('state');
        var reason = interactionGr.getValue('state_reason');
        var isVAChat = interactionGr.getValue('virtual_agent');
        var isLAChat = interactionGr.getValue('agent_chat');
        return new CAUtil().getEndState(state, reason, isVAChat, isLAChat);
    }
})(convGr);
