/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
 
   
    let translatedLabels = api.state.translatedLabels;
    let scores = {...api.state.scores};
    const viewLegacyScores = api.state.viewLegacyScores;
    

 api.setState('scores', function({ currentValue }) {
  const _scores = JSON.parse(JSON.stringify(currentValue));
  switch (event.elementId) {
        case "get_class_completeness_score":
            _scores.classResults.completeness = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
        case "get_group_completeness_score":
            _scores.groupResults.completeness = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
        case "get_service_completeness_score":
            _scores.serviceResults.completeness = getLegacyScore(getScoresByDataResource(event.elementId));
            break
        case "get_class_compliance_score":
            _scores.classResults.compliance = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
        case "get_group_compliance_score":
            _scores.groupResults.compliance = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
        case "get_service_compliance_score":
            _scores.serviceResults.compliance = getLegacyScore(getScoresByDataResource(event.elementId));
            api.setState('legacyComplianceMetricSearch',_scores.serviceResults.compliance);
            break;
        case "get_class_correctness_score":
            _scores.classResults.correctness = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
        case "get_group_correctness_score":
            _scores.groupResults.correctness = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
        case "get_service_correctness_score":
            _scores.serviceResults.correctness = getLegacyScore(getScoresByDataResource(event.elementId));
            break;
    }
return _scores;
});
    api.emit('VERIFY_SCORES');

    function getLegacyScore(metricScore) {
        var weightedScore = 0;
        var weights = api.data.get_weights.output;
        for (var i = 0; i < metricScore.length; i++) {
            var metric = metricScore[i];
            var weight = Number(weights[metric.metric]);
            metricScore[i].score = roundScore(metric.failed / metric.total * 100);
            if (metric.sub) {
                if (metric.total != 0)
                    weightedScore += ((metric.total - metric.failed) * weight) / metric.total;
                else
                    weightedScore += weight;
            }
        }
        for (var i = 0; i < metricScore.length; i++) {
            if (!metricScore[i].sub) {
                metricScore[i].legacy_score = roundScore(weightedScore);
            } else {
                metricScore[i].legacy_score = metricScore[i].score;
            }
        }
        return metricScore;
    }

    function roundScore(weightedScore) {
        if (weightedScore > 99 && weightedScore < 100)
            weightedScore = 99;
        else if (weightedScore > 0 && weightedScore < 1)
            weightedScore = 1;
        else
            weightedScore = Math.round(weightedScore);
        return weightedScore;
    }

    function getScoresByDataResource(dataResource) {
        switch (dataResource) {
            case "get_class_completeness_score":
                return api.data.get_class_completeness_score.output.result;
            case "get_class_compliance_score":
                return api.data.get_class_compliance_score.output.result;
            case "get_class_correctness_score":
                return api.data.get_class_correctness_score.output.result;
            case "get_group_completeness_score":
                return api.data.get_group_completeness_score.output.result;
            case "get_group_compliance_score":
                return api.data.get_group_compliance_score.output.result;
            case "get_group_correctness_score":
                return api.data.get_group_correctness_score.output.result;
            case "get_service_completeness_score":
                return api.data.get_service_completeness_score.output.result;
            case "get_service_compliance_score":
                return api.data.get_service_compliance_score.output.result;
            case "get_service_correctness_score":
                return api.data.get_service_correctness_score.output.result;
        }
    }

    function getScoreSettings(results) {
        var currentScore = 100 - results.score;
        var prevScore = 100 - results.prev_historic_score;
        var scorePercentageChange = currentScore - prevScore;

        var prevHistoricEvaluatedOnDate = new Date(results.prev_historic_evaluated_on).getTime();
        if (!isNaN(prevHistoricEvaluatedOnDate)) {
            // Date is valid, converting to string will show 0 as well
            scorePercentageChange = String(scorePercentageChange);
        } else {
            // Date is not valid, setting change to number 0 will not show any change
            scorePercentageChange = 0;
        }

        let score = [{
            "data": [{
                "change": scorePercentageChange,
                "changePercent": "0",
                "value": currentScore
            }],
            "metadata": {
                "aggregate": {
                    "fieldType": "decimal"
                },
                "changeArrow": scorePercentageChange > 0 ? "up" : scorePercentageChange < 0 ? "down" : "steady",
                "dataSourceLabel": "Number of open incidents",
                "eventData": {
                    "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
                },
                "filterQuery": "opened_atONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^ORopened_at<javascript:gs.beginningOfToday()^resolved_atISEMPTY^ORresolved_at>javascript:gs.endOfToday()^state!=8",
                "format": {
                    "frequency": "daily",
                    "precision": 0,
                    "unitFormat": "{0}%"
                },
                "previousScoreDate": String(prevHistoricEvaluatedOnDate),
                "scoreDate": "1642896000000"
            }
        }];
        return score;;
    }
}
