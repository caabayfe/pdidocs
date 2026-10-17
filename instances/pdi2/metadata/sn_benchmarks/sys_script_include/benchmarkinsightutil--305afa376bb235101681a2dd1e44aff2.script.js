var BenchmarkInsightUtil = Class.create();
BenchmarkInsightUtil.prototype = {
    initialize: function() {},
    getInsightData: function(benchmarkRecord) {
        var msgOrder = 0;
        if (benchmarkRecord.thumbDirection == 'positive' && benchmarkRecord.difference > 0)
            msgOrder = 300;
        if (benchmarkRecord.thumbDirection == 'negative') {
            msgOrder = 100;
            benchmarkRecord.difference = -1 * benchmarkRecord.difference;
        } else if (benchmarkRecord.difference == 0)
            msgOrder = 200;
        var insightData = {};
        insightData.insightDate = benchmarkRecord.insightGenerationDate;
        insightData.benchmarkTrend = benchmarkRecord.thumbDirection;
        insightData.message = {};
        insightData.message.order = msgOrder;
        insightData.message.parameters = [];
        if (msgOrder != 0 && msgOrder != 200) {
            insightData.message.parameters.push({
                "applyScoreUnitAndPrecisionFormatting": true,
                "value": benchmarkRecord.difference
            });
            insightData.message.parameters.push({
                "value": benchmarkRecord.unit
            });
        }
        insightData.info = {
            "parameters": [
                [{
                    "applyScoreUnitAndPrecisionFormatting": true,
                    "value": benchmarkRecord.benchmarkScore
                }],
                [{
                    "applyScoreUnitAndPrecisionFormatting": true,
                    "value": benchmarkRecord.instanceScore
                }],
                [{
                    "applyScoreUnitAndPrecisionFormatting": true,
                    "value": benchmarkRecord.topPerformersScore
                }],
                [{
                    "applyScoreUnitAndPrecisionFormatting": true,
                    "value": benchmarkRecord.percentile
                }]
            ]
        };
        return insightData;
    },
    getBenchmarkScore: function(scores) {
        var rt = {
            "local": "",
            "global": ""
        };
        for (prop in scores)
            rt[prop] = scores[prop];
        return rt;
    },
    bmDifferenceStrGenerator: function(first, second) {
        if (!first || !second)
            return {
                'thumbDirection': '',
                'difference': -100000
            };
        var difference = 0;
        var thumbDirection = '';
        if (first == second) {
            thumbDirection = 'positive';
        } else if (first > second) {
            //above benchmark
            thumbDirection = 'positive';
            difference = parseFloat((first - second).toFixed(2));
        } else {
            //below benchmark
            thumbDirection = 'negative';
            difference = parseFloat((second - first).toFixed(2));
            difference = (-1) * difference;
        }
        return {
            'thumbDirection': thumbDirection,
            'difference': difference
        };
    },
    fetchBenchmarkScores: function(startDate, endDate) {
        var bmScoreUtil = new sn_benchmarks.BenchmarkScoreUtil();
        var result = bmScoreUtil.getScoreByIndicators(bmScoreUtil.getActiveGlobalIndicatorsByCategory(), '', startDate, endDate);
        var indicatorData = {};
        var records = [];
        for (var iid in result.indicators.idMap) {
            var insight = {};
            var instanceScore = 0,
                benchmarkScore = 0,
                differenceObj = "";
            indicatorData = result.indicators.idMap[iid];
            for (month in indicatorData.scores) {
                var monthlyScores = indicatorData.scores[month];
            }
            instanceScore = this.getBenchmarkScore(monthlyScores).local.value;
            benchmarkScore = this.getBenchmarkScore(monthlyScores).global.mean;
            if (!this.getBenchmarkScore(monthlyScores).global)
                continue;
            if (indicatorData.minimize)
                differenceObj = this.bmDifferenceStrGenerator(instanceScore, benchmarkScore);
            else
                differenceObj = this.bmDifferenceStrGenerator(benchmarkScore, instanceScore);
            insight.unit = indicatorData.unitName;
            insight.thumbDirection = differenceObj.thumbDirection;
            insight.difference = differenceObj.difference;
            insight.uuid = indicatorData.pa_indicator;
            insight.benchmarkIndicator = iid;
            insight.benchmarkName = indicatorData.display;
            insight.insightGenerationDate = parseInt(indicatorData.startDate.toString().replace(/[-]/g, ""));
            insight.benchmarkScore = (this.getBenchmarkScore(monthlyScores).global.display) ? this.getBenchmarkScore(monthlyScores).global.display : 'N/A';
            insight.instanceScore = (this.getBenchmarkScore(monthlyScores).local.display) ? this.getBenchmarkScore(monthlyScores).local.display : 'N/A';
            insight.topPerformersScore = (this.getBenchmarkScore(monthlyScores).global.top10scoreDisplay) ? this.getBenchmarkScore(monthlyScores).global.top10scoreDisplay : 'N/A';
            insight.percentile = (this.getBenchmarkScore(monthlyScores).global.rank) ? this.getBenchmarkScore(monthlyScores).global.rank : 'N/A';
            records.push(insight);
        }
        // pushing in order of top performing insights to worst performing, as a result in UI, it should surface worst performing at the top
        records = records.sort(function(a, b) {
            return b.difference - a.difference;
        });
        return records;
    },
    type: 'BenchmarkInsightUtil'
};
