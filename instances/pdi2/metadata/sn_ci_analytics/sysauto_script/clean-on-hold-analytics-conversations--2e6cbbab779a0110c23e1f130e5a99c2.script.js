var logger = CIAnalyticsLogger.getLogger('Clean On Hold Conversations');
try {
    logger.info('Clean On Hold Conversations Job Started');
    var waitTime = parseInt(gs.getProperty('sn_ci_analytics.on_hold_conversations_wait_time', 600000));
    var time = new GlideDateTime();
    time.subtract(waitTime);
    var caConversationGR = new GlideRecord('sn_ci_analytics_conversation');
    caConversationGR.addQuery('status', 'onHold');
    caConversationGR.addQuery('conversation_closed_at', '<', time);
    caConversationGR.query();
    while (caConversationGR.next()) {
        caConversationGR.setValue('status', 'new');
        caConversationGR.update();
        var expirationGDT = new GlideDateTime();
        expirationGDT.addSeconds(30);
        gs.eventQueueScheduled('sn_ci_analytics.process_conversation', caConversationGR, '', '', expirationGDT);
    }
    logger.info('Clean On Hold Conversations Job Completed');
} catch (e) {
    logger.error('Error ' + e.message);
}
