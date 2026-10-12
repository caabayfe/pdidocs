(function executeRule(current, previous /*null when async*/ ) {
	g_scratchpad.agentChat = current.agent_chat;
	g_scratchpad.channelMetadataTable = current.channel_metadata_table;

    var configData = new WrapUpInteractionUtil().getWrapUpConfiguration(current);
    g_scratchpad.wrapUpData = null;
    if (configData != null) {
        g_scratchpad.wrapUpData = configData;
    }
})(current, previous);
