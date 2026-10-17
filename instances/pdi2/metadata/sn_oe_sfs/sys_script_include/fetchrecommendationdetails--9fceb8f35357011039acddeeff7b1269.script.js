var FetchRecommendationDetails = Class.create();
FetchRecommendationDetails.prototype = {
    initialize: function() {},

	//This will generate a list of intent-topic associations.
    getIntentTopicAssociations: function() {
        return new sn_oe_sfs.CITopicRecommendationsUtil().getTaxonomyIntentTopics();
    },

	//This will fetch the latest analysis record ID
    getLatestRequestId: function() {
        var nluDiscoveryReport = new GlideRecord('sn_nlu_discovery_report_definition');
        nluDiscoveryReport.addEncodedQuery('statusINcompleted,solution_complete', true);
        nluDiscoveryReport.orderByDesc('sys_created_on');
        nluDiscoveryReport.setLimit(1);
        nluDiscoveryReport.query();
        nluDiscoveryReport.next();
        return nluDiscoveryReport.getUniqueValue();
    },

	//This will fetch the report for the corresponding request ID
    getReport: function(requestId) {
        var reports = new sn_oe_sfs.CITopicRecommendationsUtil().generateReports();
        var report = {};
        reports.forEach(function(rep) {
            if (rep.requestId === requestId)
                report = rep;
        });
        return report;
    },

	//Sorts the recommendations by matches (descending)
    sortRecommendationsBasedOnMatches: function(recommendations) {
        recommendations.sort(function(a, b) {
            return b.matches - a.matches;
        });
    },

    getTotalRequestsCount: function() {
        var requestId = this.getLatestRequestId();
        var report = this.getReport(requestId);
        return report.totalRequests;
    },

    getRequestsHandledCount: function(topThreeRecommendations) {
        var requestsHandled = 0;
        topThreeRecommendations.forEach(function(rec) {
            requestsHandled += rec.matchCount;
        });
        return requestsHandled;
    },

    getPercentageOfRequestsBotCanSolve: function(requestsHandled, totalRequests) {
        return ((requestsHandled / totalRequests) * 100).toFixed(2);
    },

    getTopThreeRecommendations: function() {
        if (!this.isAnalysisSuccessfulAtleastOnce())
            return [];
        var intentTopicAssociations = this.getIntentTopicAssociations();
        var requestId = this.getLatestRequestId();
        var report = this.getReport(requestId);
        var recommendations = report.recommendations;
        this.sortRecommendationsBasedOnMatches(recommendations);
        var topThreeRecommendations = [];
        var self = this;
        recommendations.forEach(function(recommendation) {
            Object.keys(intentTopicAssociations).forEach(function(itaKey) {
                var current = intentTopicAssociations[itaKey];
                Object.keys(current).forEach(function(currentKey) {
                    if (recommendation.intent === currentKey && topThreeRecommendations.length < 3) {
                        var finalItem = {};
                        finalItem.matchCount = recommendation.matches;
                        finalItem.topicName = current[currentKey].languages.en.topicName;
                        if (!self.isMatchingTopicAlreadyFound(topThreeRecommendations, finalItem))
                            topThreeRecommendations.push(finalItem);
                    }
                });
            });
        });
        return topThreeRecommendations;
    },

    isRecommendationsAvailable: function() {
        var recommendationsList = this.getTopThreeRecommendations();
        return recommendationsList.length ? true : false;
    },

    isMatchingTopicAlreadyFound: function(recommendationsArray, item) {
        var isElementExist = false;
        for (var i = 0; i < recommendationsArray.length; i++) {
            if (recommendationsArray[i].topicName === item.topicName) {
                isElementExist = true;
            }
        }
        return isElementExist;
    },

    isAnalysisSuccessfulAtleastOnce: function() {
        var nluDiscoveryReport = new GlideRecord('sn_nlu_discovery_report_definition');
        nluDiscoveryReport.addEncodedQuery('statusINcompleted,solution_complete', true);
        nluDiscoveryReport.orderByDesc('sys_created_on');
        nluDiscoveryReport.setLimit(1);
        nluDiscoveryReport.query();
        return nluDiscoveryReport.hasNext();
    },

    getDaysPastRecentAnalysis: function() {
        var nluDiscoveryReport = new GlideRecord('sn_nlu_discovery_report_definition');
        nluDiscoveryReport.addEncodedQuery('statusINcompleted,solution_complete', true);
        nluDiscoveryReport.orderByDesc('sys_created_on');
        nluDiscoveryReport.setLimit(1);
        nluDiscoveryReport.query();
        if (nluDiscoveryReport.next()) {
            var createdOn = nluDiscoveryReport.getValue('sys_created_on');
            return new sn_oe_sfs.CIUtil().getDaysPastDateTime(createdOn);
        }
        return -1;
    },

    type: 'FetchRecommendationDetails'
};
