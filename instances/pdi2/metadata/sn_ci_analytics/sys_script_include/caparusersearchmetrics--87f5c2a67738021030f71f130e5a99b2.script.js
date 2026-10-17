var CAPARUserSearchMetrics = Class.create();
CAPARUserSearchMetrics.prototype = {
    initialize: function() {
        this.CAConfig = new CAConfig();
    },
    _getSumOfScores: function(scores) {
        var score = 0;
        scores.forEach(function(obj) {
            score += obj.value ? obj.value : 0;
        });
        return score;
    },

    _queryPARScoreCard: function(payload, includeScores) {
        if (gs.nil(payload.indicatorId))
            return [];
        var sc = new PAScorecard();
        sc.addParam('uuid', payload.indicatorId);
        sc.addParam('from', payload.startDate);
        sc.addParam('to', payload.endDate);
        sc.addParam('include_scores', includeScores);
        if (!gs.nil(payload.breakdownId))
            sc.addParam('breakdown', payload.breakdownId);
        if (!gs.nil(payload.pageNumber))
            sc.addParam('page', payload.pageNumber);
        if (!gs.nil(payload.pageSize))
            sc.addParam('per_page', payload.pageSize);
        return sc.query();
    },

    _getTotalIndicatorScore: function(payload) {
        var result = this._queryPARScoreCard({
            indicatorId: payload.indicatorId,
            startDate: payload.startDate,
            endDate: payload.endDate
        }, true);
        return (result && result[0]) ? this._getSumOfScores(result[0].scores) : 0;
    },

    _getTotalNumberOfBreakdowns: function(payload) {
        var clonePayload = JSON.parse(JSON.stringify(payload));
        clonePayload.pageNumber = 1;
        clonePayload.pageSize = this.CAConfig.getMaximumSearchesSupported() - 1;
        var result = this._queryPARScoreCard(clonePayload, true);
        return result ? result.length : 0;
    },

    fetchBreakdownScores: function(payload) {
        var result = this._queryPARScoreCard(payload, true);
        var totalScore = this._getTotalIndicatorScore(payload);
        if (totalScore == 0)
            return {
                breakdowns: [],
                totalBreakdowns: 0
            };
        var totalBreakdowns = this._getTotalNumberOfBreakdowns(payload);
        var breakdowns = [];
        for (var i = 0; i < result.length; i++) {
            var score = this._getSumOfScores(result[i].scores);
            if (score == 0)
                continue;
            breakdowns.push({
                breakdown: result[i].element.display_value,
                score: score,
                percentage: (score / totalScore) * 100
            });
        }
        breakdowns.sort(function(a, b) {
            return b.percentage - a.percentage;
        });
        return {
            breakdowns: breakdowns,
            totalBreakdowns: totalBreakdowns
        }
    },

    type: 'CAPARUserSearchMetrics'
};
