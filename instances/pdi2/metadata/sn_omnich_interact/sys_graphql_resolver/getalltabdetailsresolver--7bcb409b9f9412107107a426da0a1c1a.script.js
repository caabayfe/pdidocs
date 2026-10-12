(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here
    var userId = env.getArguments().userId;
    var tabDetailGR = new GlideRecordSecure('sys_cs_message_tab_detail');
    tabDetailGR.addQuery('receiver', userId);
    tabDetailGR.addQuery('is_active', true);
    tabDetailGR.query();
    var results = [];
    while (tabDetailGR.next()) {
        var count = 0;
        var lastReceivedMessageId = "";
        var messageGR = new GlideRecordSecure('sys_cs_message');
        messageGR.addQuery('conversation', tabDetailGR.interaction.channel_metadata_document);
        messageGR.addQuery('direction', 'inbound');
        messageGR.query();
        var totalMessages = messageGR.getRowCount();
        var isLastReadMessage = false;
        while (messageGR.next()) {
            count++;
            lastReceivedMessageId = messageGR.getUniqueValue('sys_id');
            if (messageGR.getUniqueValue('sys_id') == tabDetailGR.getValue('last_read_message_id')) {
                isLastReadMessage = true;
                break;
            }
        }

        while (messageGR.next()) {
            lastReceivedMessageId = messageGR.getUniqueValue('sys_id');
        }
        count = isLastReadMessage ? totalMessages - count : totalMessages;

        results.push({
            count: count,
            interactionId: tabDetailGR.interaction.getValue('sys_id'),
            lastSeenMessageId: tabDetailGR.getValue('last_read_message_id'),
            lastReceivedMessageId: lastReceivedMessageId,
            type: tabDetailGR.interaction.type
            
        });
    }
    return results;

})(env);
