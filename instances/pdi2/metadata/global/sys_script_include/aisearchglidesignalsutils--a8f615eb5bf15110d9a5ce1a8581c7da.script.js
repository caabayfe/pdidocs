var AISearchGlideSignalsUtils = Class.create();
AISearchGlideSignalsUtils.prototype = {
    initialize: function() {
        this.recordLimit = parseInt(gs.getProperty('glide.signals.queued_signal_processing_limit', 2000));
    },

    /**
     * Reads from the queued signals staging table, sys_signal_event_queue, and sends the events in to the Signals API
     */
    processQueuedSignals: function() {
        var signalsService = new GlideSignalsService();
        var queuedEventsGr = new GlideRecord("sys_signal_event_queue");
        queuedEventsGr.setLimit(this.recordLimit);
        queuedEventsGr.orderBy("sys_created_on");
        queuedEventsGr.query();
        var errorMessageTemplate = "Failed to process signal event of type: 'EVENT_TYPE', priority: 'EVENT_PRIORITY', body: 'EVENT_BODY', created: 'EVENT_CREATION'";
        var processedEvents = [];
        while (queuedEventsGr.next()) {
            var eventAction = queuedEventsGr.getValue("event_action");
            var eventPriority = queuedEventsGr.getValue("event_priority");
            var eventBody = JSON.parse(queuedEventsGr.getValue("event_body"));
            try {
                if (eventAction == 'SEARCH_EVENT') {
                    // When server-side signal logging is enabled, we need to determin if 
                    // the search event was an "original" search, a sort, a refinement, or a pagination event
                    eventAction = signalsService.getAisSignalEventType(eventBody);
                }
                signalsService.trackEvent(eventAction, eventPriority, eventBody);
            } catch (e) {
                var errorMessage = errorMessageTemplate.replace('EVENT_TYPE', eventAction)
                    .replace('EVENT_PRIORITY', eventPriority)
                    .replace('EVENT_BODY', eventBody)
                    .replace('EVENT_CREATION', queuedEventsGr.getValue("sys_created_on"));
                gs.error(errorMessage, e);
            }
            processedEvents.push(queuedEventsGr.getUniqueValue());
        }

        if (processedEvents.length > 0) {
            queuedEventsGr.initialize();
            queuedEventsGr.addQuery("sys_id", processedEvents);
            queuedEventsGr.query();
            queuedEventsGr.deleteMultiple();
        }
    },

    type: 'AISearchGlideSignalsUtils'
};
