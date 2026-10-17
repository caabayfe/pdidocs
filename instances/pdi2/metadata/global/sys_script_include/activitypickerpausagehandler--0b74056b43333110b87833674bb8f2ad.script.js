var ActivityPickerPAUsageHandler = Class.create();
ActivityPickerPAUsageHandler.prototype = {
    initialize: function() {
        this.ACCEPTED = 'Accepted';
        this.UNLICENSED = 'Unlicensed';
    },

    reportToGCF: function(usages) {
        for (var i = 0; i < usages.length; i++) {
            var usage = usages[i];
            var gcf_map = new GCFSampleMap();

            gcf_map.put('spoke', usage.spoke);
            gcf_map.put('type', usage.type);
            gcf_map.put('name', usage.name);
            gcf_map.put('asset_id', usage.sysId);
            gcf_map.put('include_all_assets', usage.isIncludeAllAssets);
            gcf_map.put('ai_recommended', global.PDUtils.isPlaybookRecommendationsEnabledForUser() ? usage.recommendationStatus : this.UNLICENSED);
            gcf_map.put('search_query', usage.searchQuery);

            try {
                var padGCFCollector = new global.PADGCFCollector();
                padGCFCollector.recordProcessUsageEventWithMap(padGCFCollector.processEvents.PLACEHOLDER_ACTIVITY_PICKED, gcf_map);
            } catch (e) {
                gs.error('Send usage event failed: ' + e.message);
                return false;
            }
        }
        return true;
    },

    reportGenAIFeedback: function(usages) {
        for (var i = 0; i < usages.length; i++) {
            var usage = usages[i];

            if (usage.recommendationStatus !== this.ACCEPTED) {
                continue;
            }

            var request = {};
            request['logId'] = usage.recommendationLogId;
            request['feedback'] = this.ACCEPTED;
            request['additionalData'] = 'Search Query: ' + usage.searchQuery + '\nType: ' + usage.type + ' \nName: ' + usage.name + ' \nSysID: ' + usage.sysId;
            request['isResponseEdited'] = 'false';
            request['search_query'] = usage.searchQuery;

            try {
                var result = new sn_one_extend.GenerativeAIUtility.sendFeedback(request);
            } catch (e) {
                gs.error('Send AI Feedback failed: ' + e);
                return false;
            }
        }
        return true;
    },

    reportUsage: function(inputUsageData) {
        var usages = inputUsageData.usages;

        var gcf_reported = this.reportToGCF(usages);
        var feedback_reported = this.reportGenAIFeedback(usages);

        return (gcf_reported && feedback_reported);
    },

    type: 'ActivityPickerPAUsageHandler'
};
