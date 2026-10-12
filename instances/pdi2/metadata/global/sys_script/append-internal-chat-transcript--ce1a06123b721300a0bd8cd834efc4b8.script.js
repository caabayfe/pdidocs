(function executeRule(current, previous /*null when async*/ ) {
    if (current.agent_chat) {
        channelmetadata_document = current.channel_metadata_document + ":" + current.channel_metadata_table;
        gs.eventQueue("interaction.internal_transcript", null, current.sys_id, channelmetadata_document);
    }
})(current, previous);
