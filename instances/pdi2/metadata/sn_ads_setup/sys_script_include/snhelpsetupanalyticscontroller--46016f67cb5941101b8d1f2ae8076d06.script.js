var SNHelpSetupAnalyticsController = Class.create();

SNHelpSetupAnalyticsController.prototype = {

    CATEGORY: 'adoption_services',
    POINT: 'guided_setup',
    ACTIVE_SETUP_TYPE_EVENT: 'active_setup_type',
    SETUP_START_TASK_COMPLETION_EVENT: 'setup_start_task_completion',
    EMBEDDED_OR_STANDALONE: 'embedded_or_standalone',

    logData: function(category, point, event, data) {

        if (!data) {
            gs.log("SNHelpSetupAnalyticsController: Data has not been provided");
            return;
        }

        var sm = new GCFSampleMap();
        for (var prop in data) {
            sm.put(prop, data[prop]);
        }

        GCFCollector.recordUsageEvent(category, point, event, sm);

    },

    rangeConversionToTenSizeBatches: function(count) {
        --count;
        count = count - count % 10;
        var range = (count + 1) + '-' + (count + 10);
        return range;
    },

    type: 'SNHelpSetupAnalyticsController'

};
