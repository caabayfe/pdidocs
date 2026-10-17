/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    
    // create a copy of scores from state
    let scores = {...api.state.scores};
    const selectedType = api.state.selectedType;
    const viewLegacyScores = api.state.viewLegacyScores;
    const selectedHealthCard = api.state.selectedHealthCard;
    const selectedID = api.state.selectedID;
    let translatedLabels = api.state.translatedLabels;

    //////// build completeness card ////////
    let completenessResults = [];
    switch(selectedType) {
        case "class":
            completenessResults = scores.classResults.completeness || [];
            break;
        case "service":
            completenessResults = scores.serviceResults.completeness || [];
            break;
        case "group":
            completenessResults = scores.groupResults.completeness|| [];
            break;
    }
    if(Object.keys(completenessResults).length != 0){
        let completenessParentResults = Array.isArray(completenessResults) && completenessResults.find((element) => element.metric == 'COMPLETENESS');
        scores.completenessCard.caption = {
            "label": await helpers.translate("Based on CIs evaluated as of {0}", completenessParentResults.updated)
        };
        scores.completenessCard.semiDonut = getSemiDonutSettings(completenessParentResults, translatedLabels.COMPLETE, translatedLabels.INCOMPLETE);
        scores.completenessCard.scoreSettings = getScoreSettings(completenessParentResults);
        scores.completenessCard.errorConfig = await getErrorConfig(completenessParentResults, 'completeness', completenessResults);
        scores.completenessCard.score = !viewLegacyScores ? 100 - completenessParentResults.score : completenessParentResults.legacy_score;
        scores.completenessCard.scorePercentageChange = scores.completenessCard.score  - (!viewLegacyScores ? 100 - scores.classResults.completeness.prev_historic_score : scores.classResults.completeness.prev_historic_score );
        scores.completenessCard.error = scores.completenessCard.errorConfig.showError;
        scores.completenessCard.completeStatus = completenessParentResults.status === "complete";
        scores.completenessCard.active = completenessParentResults.active;
    } else {
        // No results. Reset to default values
        scores.completenessCard.score = 0;
        scores.completenessCard.scorePercentageChange = 0;

    }


    //////// build correctness card ////////
    let correctnessResults = [];
    switch(selectedType) {
        case "class":
            correctnessResults = scores.classResults.correctness|| [];
            break;
        case "service":
            correctnessResults = scores.serviceResults.correctness || [];
            break;
        case "group":
            correctnessResults = scores.groupResults.correctness|| [];
            break;
    }

    if(Object.keys(correctnessResults).length != 0){
        let correctnessParentResults = Array.isArray(correctnessResults) && correctnessResults.find((element) => element.metric == 'CORRECTNESS');
        scores.correctnessCard.caption = {
            "label": await helpers.translate("Based on CIs evaluated as of {0}", correctnessParentResults.updated)
        };
        scores.correctnessCard.semiDonut = getSemiDonutSettings(correctnessParentResults, translatedLabels.COMPLETE, translatedLabels.INCOMPLETE);
        scores.correctnessCard.scoreSettings = getScoreSettings(correctnessParentResults);
        scores.correctnessCard.errorConfig = await getErrorConfig(correctnessParentResults, 'correctness', correctnessResults);
        scores.correctnessCard.score = !viewLegacyScores ? 100 - correctnessParentResults.score : correctnessParentResults.legacy_score;
        scores.correctnessCard.scorePercentageChange = scores.correctnessCard.score  - (viewLegacyScores ? 0 : 100 - correctnessResults.prev_historic_score);
        scores.correctnessCard.error = scores.correctnessCard.errorConfig.showError;
        scores.correctnessCard.completeStatus = correctnessParentResults.status === "complete";
        scores.correctnessCard.active = correctnessParentResults.active;
    } else {
        // No results. Reset to default values
        scores.correctnessCard.score = 0;
        scores.correctnessCard.scorePercentageChange = 0;
    }
    
    
    //////// build compliance card ////////
    let complianceResults = [];
    switch(selectedType) {
        case "class":
            complianceResults = scores.classResults.compliance|| [];
            break;
        case "service":
            complianceResults = scores.serviceResults.compliance || [];
            break;
        case "group":
            complianceResults = scores.groupResults.compliance|| [];
            break;
    }
    if(Object.keys(complianceResults).length != 0){
        let complianceParentResults = Array.isArray(complianceResults) && complianceResults.find((element) => element.metric == 'COMPLIANCE');
        scores.complianceCard.caption = {
            "label": await helpers.translate("Based on CIs evaluated as of {0}", complianceParentResults.updated)
        };
        scores.complianceCard.semiDonut = getSemiDonutSettings(complianceParentResults, translatedLabels.COMPLETE, translatedLabels.INCOMPLETE);
        scores.complianceCard.scoreSettings = getScoreSettings(complianceParentResults);
        scores.complianceCard.errorConfig = await getErrorConfig(complianceParentResults, 'compliance', complianceResults);
        scores.complianceCard.score =  !viewLegacyScores ? 100 - complianceParentResults.score : complianceParentResults.legacy_score;
        scores.complianceCard.scorePercentageChange = scores.complianceCard.score  - (100 - complianceResults.prev_historic_score);
        scores.complianceCard.error = scores.complianceCard.errorConfig.showError;
        scores.complianceCard.completeStatus = complianceParentResults.status === "complete";
        scores.complianceCard.active = complianceParentResults.active;
    } else {
        // No results. Reset to defacult values
        scores.complianceCard.score = 0;
        scores.complianceCard.scorePercentageChange = 0;
    }
    

   // update overall scores
    if ((!scores.completenessCard.completeStatus && scores.completenessCard.active) 
            || (!scores.correctnessCard.completeStatus && scores.correctnessCard.active)
            || (!scores.complianceCard.completeStatus && scores.complianceCard.active)) {
        scores.overAllScore = "N/A";
    } else if (viewLegacyScores){
        let activeMetrics = [];
        if (scores.completenessCard.active) {
            let weightedCompletenessScore = getParentMetricLegacyWeightedScore(completenessResults);
            activeMetrics.push(weightedCompletenessScore);
        }
        if (scores.correctnessCard.active) {
            let weightedCorrectnessScore = getParentMetricLegacyWeightedScore(correctnessResults);
            activeMetrics.push(weightedCorrectnessScore);
        }
        if (scores.complianceCard.active) {
            let weightedComplianceScore = getParentMetricLegacyWeightedScore(complianceResults);
            activeMetrics.push(weightedComplianceScore);
        }
        
        scores.overAllScore = getLegacyOverallScore(activeMetrics) + '%';
    } else {
        let activeMetrics = [];
        if (scores.completenessCard.active && Object.keys(completenessResults).length != 0) {
            activeMetrics.push(validateParentScore(scores.completenessCard.score, completenessResults[0].total));
        }
        if (scores.correctnessCard.active && Object.keys(correctnessResults).length != 0) {
            activeMetrics.push(validateParentScore(scores.correctnessCard.score, correctnessResults[0].total));
        }
        if (scores.complianceCard.active && Object.keys(complianceResults).length != 0) {
            activeMetrics.push(validateParentScore(scores.complianceCard.score, complianceResults[0].total));
        }

        var overAll = getOverallScore(activeMetrics);
        scores.overAllScore = roundScore(overAll) + "%";
    }

    //save scores back to state by setting it to an empty object then using a timeout to force a refresh. 
    api.setState('scores',{}); 
    helpers.timing.setTimeout(() => {
        api.setState('scores',scores);
    }, 0);

   function getSemiDonutSettings(results, greenGroup, redGroup) {
        const donutConfig = [{
            "data": [{
                    "assignment_group": greenGroup,
                    "value": results.total - results.failed
                },
                {
                    "assignment_group": redGroup,
                    "value": results.failed
                }
            ],
            "metadata": {
                "dataSourceLabel": translatedLabels.CIS_EVALUATED,
                "format": {
                    "abbreviationEnabled": true,
                    "numberInTooltipsEnabled": true,
                    "unitFormat": "{0}"
                },
                "groupBy": [{
                    "elements": [{
                            "cssCustomProperty": "--now-datavis_color--green-4",
                            "defaultColor": "41,169,62",
                            "label": greenGroup
                        },
                        {
                            "cssCustomProperty": "--now-color_alert--critical-2",
                            "defaultColor": "174,92,229",
                            "label": redGroup
                        }
                    ],
                    "fieldType": "reference",
                    "id": "assignment_group",
                    "label": "Assignment group"
                }]
            }
        }];
        return donutConfig;
    }

    function getScoreSettings(results) {
        var currentScore = !viewLegacyScores ? 100 - results.score : results.legacy_score; 
        var prevScore = !viewLegacyScores ? 100 - results.prev_historic_score : results.prev_historic_score ;
        var scorePercentageChange = currentScore - prevScore;

        var prevHistoricEvaluatedOnDate = results.prev_historic_evaluated_on;
        //api returns "N/A" if historic evaluation date is unavailable
        if (prevHistoricEvaluatedOnDate != "N/A") {
            //handle the case when user date format is different than system default, eg. dd/MM/yyyy
            let userDateFormat = api.context.session.user.dateFormat.toUpperCase() + ' HH:mm:ss' || 'YYYY-MM-DD HH:mm:ss';
            //change to timestamp format required for score component 
            prevHistoricEvaluatedOnDate = NowDateTime(prevHistoricEvaluatedOnDate, userDateFormat).valueOf();
            // Date is valid, converting to string will show 0 as well
            scorePercentageChange = String(scorePercentageChange);
        } else {
            // Date is not valid, setting change to number 0 will not show any change
            scorePercentageChange = 0;
        }

        let score = [{
            "data": [{
                "change": !api.state.viewLegacyScores ? scorePercentageChange : "",
                "changePercent": "0",
                "value": roundScore(currentScore)
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
                "previousScoreDate": !api.state.viewLegacyScores ? String(prevHistoricEvaluatedOnDate) : "",
                "scoreDate": "1642896000000"
            }
        }];
        return score;;
    }

    // TODO: we need to refactor this to be returned within a composite broker via scriplet. 
    // It will be a lot cleaner to loop through all the results and set the error status there
    // instead of 'checking' for which one we got back
    async function getErrorConfig(results, parentMetric, fullResults) {
        const status = results.status;
        let showError = false;
        let showSubMetricError = false;
        let maxFailures = false;
        let incomplete = false;
        let dailyTimeout = false;
        let errorMessageHeading = ' ';
        let errorMessageDetail = ' ';
        if (status == 'not_run') {
            showError = true;
            errorMessageHeading = translatedLabels.THIS_KPI_HAS_NOT_RUN;
            errorMessageDetail = await helpers.translate("Run the {0} score calculation health job to evaluate {1} for CIs", parentMetric, parentMetric);
        }

        if (!showError && parentMetric.includes('completeness')) {
            if (checkSubMetric(results, 'RECOMMENDED', fullResults)) {
                showError = true;
                showSubMetricError = true;
                if(isIncomplete(results, 'RECOMMENDED', fullResults)) {
                    incomplete = true;
                } else if (isMaxFailures(results, 'RECOMMENDED', fullResults)) {
                    maxFailures = true;
                } else {
                    dailyTimeout = true;
                }
            }
            if (checkSubMetric(results, 'REQUIRED', fullResults)) {
                showError = true;
                showSubMetricError = true;
                if(isIncomplete(results, 'REQUIRED', fullResults)) {
                    incomplete = true;
                } else if (isMaxFailures(results, 'REQUIRED', fullResults)) {
                    maxFailures = true;
                } else {
                    dailyTimeout = true;
                }
            }
        }

        if (!showError && parentMetric.includes('correctness')) {
            if (checkSubMetric(results, 'DUPLICATE', fullResults)) {
                showError = true;
                showSubMetricError = true;
                if(isIncomplete(results, 'DUPLICATE', fullResults)) {
                    incomplete = true;
                } else if (isMaxFailures(results, 'DUPLICATE', fullResults)) {
                    maxFailures = true;
                } else {
                    dailyTimeout = true;
                }
            } 
            if (checkSubMetric(results, 'ORPHAN', fullResults)) {
                showError = true;
                showSubMetricError = true;
                if(isIncomplete(results, 'ORPHAN', fullResults)) {
                    incomplete = true;
                } else if (isMaxFailures(results, 'ORPHAN', fullResults)) {
                    maxFailures = true;
                } else {
                    dailyTimeout = true;
                }
            } 
            if (checkSubMetric(results, 'STALENESS', fullResults)) {
                showError = true;
                showSubMetricError = true;
                if(isIncomplete(results, 'STALENESS', fullResults)) {
                    incomplete = true;
                } else if (isMaxFailures(results, 'STALENESS', fullResults)) {
                    maxFailures = true;
                } else {
                    dailyTimeout = true;
                }
            }
        }

        if (!showError && parentMetric.includes('compliance')) {
            if (checkSubMetric(results, 'AUDIT', fullResults)) {
                showError = true;
                showSubMetricError = true;
                if(isIncomplete(results, 'AUDIT', fullResults)) {
                    incomplete = true;
                } else if (isMaxFailures(results, 'AUDIT', fullResults)) {
                    maxFailures = true;
                } else {
                    dailyTimeout = true;
                }
            }
        }

        if (showSubMetricError) {
            errorMessageHeading = translatedLabels.ONE_OR_MORE_JOBS_FAILED;

            if (dailyTimeout) {
                errorMessageDetail = translatedLabels.DAILY_TIMEOUT_MESSAGE;
            } else if (maxFailures) { 
                errorMessageDetail = translatedLabels.MAX_FAILURES_MESSAGE;
            } else if (incomplete) {
                errorMessageDetail = translatedLabels.INCOMPLETE_MESSAGE;
            }
        }


        if (!showError && status == 'complete' && results.total == 0) {
            showError = true;
            errorMessageHeading = translatedLabels.NO_DATA_AVAILABLE;
            errorMessageDetail = translatedLabels.JOB_COMPLETED_NO_CIS;
        }
        return {
            'showError': showError,
            'errorMessageHeading': errorMessageHeading,
            'errorMessageDetail': errorMessageDetail,
            'maxFailures': maxFailures,
            'incomplete': incomplete,
            'dailyTimeout': dailyTimeout
        };
    }

    function checkSubMetric(results, subMetric, fullResults) {
        return isIncomplete(results, subMetric, fullResults) || isMaxFailures(results, subMetric, fullResults) 
            || hasTimedOut(results, subMetric, fullResults);
    }
    
    function isIncomplete(results, subMetric, fullResults) {
        let subMetricResult = Array.isArray(fullResults) && fullResults.find((element) => element.metric == subMetric);
        return subMetricResult.status == 'incomplete';
    }

    function isMaxFailures(results, subMetric, fullResults) {
        let subMetricResult = Array.isArray(fullResults) && fullResults.find((element) => element.metric == subMetric);
        return subMetricResult.status == 'max_failures';
    }

    function hasTimedOut(results, subMetric, fullResults) {
        let subMetricResult = Array.isArray(fullResults) && fullResults.find((element) => element.metric == subMetric);
        return subMetricResult.status == 'time_out';
    }

   function getLegacyOverallScore(parentMetricScores) {
        let weightedScore = 0;
        for (var i = 0; i < parentMetricScores.length; i++) {
            weightedScore += parentMetricScores[i];
        }
        
        return roundScore(weightedScore);
    }

    function getOverallScore(parentMetricScores) {
        let weightedScore = 0;
        for (var i = 0; i < parentMetricScores.length; i++) {
            weightedScore += parentMetricScores[i];
        }
        
        if (parentMetricScores.length > 0) {
            weightedScore = weightedScore / parentMetricScores.length;
        }

        return roundScore(weightedScore);
    }

    function validateParentScore(score, total) {
        if (total == 0 && isNaN(score)) {
            return 100;
        }
        return score;
    }

    function getParentMetricLegacyWeightedScore(metricScore) {
        var weights = api.data.get_weights.output;
        var weightedScore = 0;
        for (var i = 0; i < metricScore.length; i++) {
            if (!metricScore[i].sub) {
                weightedScore += (Number(weights[metricScore[i].metric]) * metricScore[i].legacy_score) / 100.0;
            }
        }
        return weightedScore;
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

}
