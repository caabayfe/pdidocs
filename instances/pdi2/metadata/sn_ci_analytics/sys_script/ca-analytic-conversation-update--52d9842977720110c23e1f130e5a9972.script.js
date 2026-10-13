(function executeRule(current, previous /*null when async*/ ) {
    var caAnalyticsGr = new GlideRecord("sn_ci_analytics_conversation");
    caAnalyticsGr.addQuery("conversation", current.sys_id);
    caAnalyticsGr.query();
    if (caAnalyticsGr.next()) {
        var caProcessor = new CAProcessor();
        caAnalyticsGr.setValue("conversation_state", "completed");
        caAnalyticsGr.setValue("conversation_closed_at", current.conversation_completed);
        var isOnholdCS = caProcessor.shouldHoldAnalyticsConversation(current);
        if (isOnholdCS) {
            caAnalyticsGr.setValue("status", "onHold");
        }
        caAnalyticsGr.update();
        if (!isOnholdCS) {
            var disableAsyncBRProcessing = gs.getProperty("sn_ci_analytics.disable.async.br.processing", "false");
            if (disableAsyncBRProcessing === "false") {
                if (!caProcessor.isInteractionClosed(current.sys_id)) {
                    var expirationGDT = new GlideDateTime();
                    expirationGDT.addSeconds(30);
                    gs.eventQueueScheduled('sn_ci_analytics.process_conversation', caAnalyticsGr, '', '', expirationGDT);
                } else {
                    caProcessor.processConversation(caAnalyticsGr);
                }
            }
        }
    }
})(current, previous);
