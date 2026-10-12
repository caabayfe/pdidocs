/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
 function handler({
    api,
    event,
    helpers,
    imports
}) {
    let translatedLabels = api.state.translatedLabels;
    const {
        elementId
    } = event;
    switch (elementId) {
        case "completeness_details_button":
            populateCompletenessPopover();
            break;
        case "correctness_details_button":
            populateCorrectnessPopover();
            break;
        case "compliance_details_button":
            populateCompliancePopover();
            break;
    }

    const totalsErrorMessage = '-- / --';

    async function populateCompletenessPopover() {
        let completenessPopover = { ...api.state.completenessPopover
        };
        let completenessResults = getScoresByTypeAndMetric();
        let recommendedResults = completenessResults.find((element) => element.metric == 'RECOMMENDED');
        completenessPopover.recommended.jobStatus = recommendedResults.status;
        completenessPopover.recommended.jobStatusColor = getJobStatusColor(recommendedResults.status);
        completenessPopover.recommended.scoreLabel = await getRecommendedScoreLabel();
        completenessPopover.recommended.scoreSettings = getScoreSettings(recommendedResults);
        completenessPopover.recommended.error = recommendedResults.status == 'incomplete' || recommendedResults.status == 'max_failures' || recommendedResults.status == 'not_run' || recommendedResults.status == 'time_out' || recommendedResults.total == 0;
        completenessPopover.recommended.successRatioLabel = await getsuccessRatioLabel();
        completenessPopover.recommended.successRatioValue = !completenessPopover.recommended.error ? getsuccessRatioValue(recommendedResults) : totalsErrorMessage;


        let requiredResults = completenessResults.find((element) => element.metric == 'REQUIRED');
        completenessPopover.required.jobStatus = requiredResults.status;
        completenessPopover.required.jobStatusColor = getJobStatusColor(requiredResults.status);
        completenessPopover.required.scoreLabel = await getRequiredScoreLabel();
        completenessPopover.required.scoreSettings = getScoreSettings(requiredResults);
        completenessPopover.required.error = requiredResults.status == 'incomplete' || requiredResults.status == 'max_failures' || requiredResults.status == 'not_run' || requiredResults.status == 'time_out' || requiredResults.total == 0;
        completenessPopover.required.successRatioLabel = await getsuccessRatioLabel();
        completenessPopover.required.successRatioValue = !completenessPopover.required.error ? getsuccessRatioValue(requiredResults) : totalsErrorMessage;
        api.setState('completenessPopover', completenessPopover);
    }

    async function populateCorrectnessPopover() {
        let correctnessPopover = { ...api.state.correctnessPopover
        };
        let correctnessResults = getScoresByTypeAndMetric();
        let duplicateResults = correctnessResults.find((element) => element.metric == 'DUPLICATE');
        correctnessPopover.duplicate.jobStatus = duplicateResults.status;
        correctnessPopover.duplicate.jobStatusColor = getJobStatusColor(duplicateResults.status);
        correctnessPopover.duplicate.scoreLabel = await getDuplicateScoreLabel();
        correctnessPopover.duplicate.scoreSettings = getScoreSettings(duplicateResults);
        correctnessPopover.duplicate.error = duplicateResults.status == 'incomplete' || duplicateResults.status == 'max_failures' || duplicateResults.status == 'not_run' || duplicateResults.status == 'time_out' || duplicateResults.total == 0;
        correctnessPopover.duplicate.successRatioLabel = await getsuccessRatioLabel();
        correctnessPopover.duplicate.successRatioValue = !correctnessPopover.duplicate.error ? getsuccessRatioValue(duplicateResults) : totalsErrorMessage;

        let orphanResults = correctnessResults.find((element) => element.metric == 'ORPHAN');
        correctnessPopover.orphan.jobStatus = orphanResults.status;
        correctnessPopover.orphan.jobStatusColor = getJobStatusColor(orphanResults.status);
        correctnessPopover.orphan.scoreLabel = await getOrphanScoreLabel();
        correctnessPopover.orphan.scoreSettings = getScoreSettings(orphanResults);
        correctnessPopover.orphan.error = orphanResults.status == 'incomplete' || orphanResults.status == 'max_failures' || orphanResults.status == 'not_run' || orphanResults.status == 'time_out' || orphanResults.total == 0;
        correctnessPopover.orphan.successRatioLabel = await getsuccessRatioLabel();
        correctnessPopover.orphan.successRatioValue = !correctnessPopover.orphan.error ? getsuccessRatioValue(orphanResults) : totalsErrorMessage;

        let stalenessResults = correctnessResults.find((element) => element.metric == 'STALENESS');
        correctnessPopover.staleness.jobStatus = stalenessResults.status;
        correctnessPopover.staleness.jobStatusColor = getJobStatusColor(stalenessResults.status);
        correctnessPopover.staleness.scoreLabel = await getStalenesScoreLabel();
        correctnessPopover.staleness.scoreSettings = getScoreSettings(stalenessResults);
        correctnessPopover.staleness.error = stalenessResults.status == 'incomplete' || stalenessResults.status == 'max_failures' || stalenessResults.status == 'not_run' || stalenessResults.status == 'time_out' || stalenessResults.total == 0;
        correctnessPopover.staleness.successRatioLabel = await getsuccessRatioLabel();
        correctnessPopover.staleness.successRatioValue = !correctnessPopover.staleness.error ? getsuccessRatioValue(stalenessResults) : totalsErrorMessage;
        api.setState('correctnessPopover', correctnessPopover);
    }

    async function populateCompliancePopover() {
        let compliancePopover = { ...api.state.compliancePopover
        };
        let complianceResults = getScoresByTypeAndMetric();
        let auditResults = complianceResults.find((element) => element.metric == 'AUDIT');
        compliancePopover.audit.jobStatus = auditResults.status;
        compliancePopover.audit.jobStatusColor = getJobStatusColor(auditResults.status);
        compliancePopover.audit.scoreLabel = await getAuditScoreLabel();
        compliancePopover.audit.scoreSettings = getScoreSettings(auditResults);
        compliancePopover.audit.error = auditResults.status == 'incomplete' || auditResults.status == 'max_failures' || auditResults.status == 'not_run' || auditResults.status == 'time_out' || auditResults.total == 0;
        compliancePopover.audit.successRatioLabel = await getsuccessRatioLabel();
        compliancePopover.audit.successRatioValue = !compliancePopover.audit.error ? getsuccessRatioValue(auditResults) : totalsErrorMessage;
        api.setState('compliancePopover', compliancePopover);
    }

    function getScoresByTypeAndMetric() {
        switch (api.state.selectedType) {
            case "class":
                return getClassScoresByMetric();
            case "group":
                return getGroupScoresByMetric();
            case "service":
                return getServiceScoresByMetric();
        }
    }

    function getClassScoresByMetric() {
        switch (elementId) {
            case "completeness_details_button":
                return api.data.get_class_completeness_score.output.result;
            case "correctness_details_button":
                return api.data.get_class_correctness_score.output.result;
            case "compliance_details_button":
                return api.data.get_class_compliance_score.output.result;
        }
    }

    function getGroupScoresByMetric() {
        switch (elementId) {
            case "completeness_details_button":
                return api.data.get_group_completeness_score.output.result;
            case "correctness_details_button":
                return api.data.get_group_correctness_score.output.result;
            case "compliance_details_button":
                return api.data.get_group_compliance_score.output.result;
        }
    }

    function getServiceScoresByMetric() {
        switch (elementId) {
            case "completeness_details_button":
                return api.data.get_service_completeness_score.output.result;
            case "correctness_details_button":
                return api.data.get_service_correctness_score.output.result;
            case "compliance_details_button":
                return api.data.get_service_compliance_score.output.result;
        }
    }

    function getScoreSettings(results) {

        var value = !api.state.viewLegacyScores ? 100 - results.score : results.score;
        roundScore(value);
        let score = [{
            "data": [{
                "change": results.score_percentage_change,
                "changePercent": "0",
                "value": roundScore(value)
            }],
            "metadata": {
                "aggregate": {
                    "fieldType": "decimal"
                },
                "changeArrow": results.score_percentage_change > 0 ? "up" : results.score_percentage_change < 0 ? "down" : "steady",
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
                "previousScoreDate": String(new Date(results.recent_historic_evaluated_on).getTime()),
                "scoreDate": "1642896000000"
            }
        }];
        return score;;
    }

    function getJobStatusColor(status) {
        switch (status) {
            case 'time_out':
                return 'yellow';
            case 'max_failures':
            case 'incomplete':
                return 'pink';
            case 'not_run':
            case 'draft':
            case 'in_progress':
                return 'blue';
            default:
                return 'gray';
        }
    }

     function getsuccessRatioLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.FAILED_CIS_EVALUATED_CIS;
        } else {
            return translatedLabels.HEALTHY_CIS_EVALUATED_CIS;
        }

    }

    function getsuccessRatioValue(results) {
        if (api.state.viewLegacyScores) {
            return abbreviateNumber(results.failed) + " / " + abbreviateNumber(results.total);
        } else {
            return abbreviateNumber(results.total - results.failed) + " / " + abbreviateNumber(results.total);
        }
    }

    function abbreviateNumber(num) {
        if (isNaN(num)) {
            return 0;
        }
        const lang = api.context.session.user.language || 'en';
        const country = api.context.session.user.country || 'US';
        const locale = lang && country ? `${lang}-${country}` : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 2
            }).format(num);
        } catch(e) {
            // if there is a problem, let's use default en-US locale
            return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 2
            }).format(num);
        }
    }

    function getRequiredScoreLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.CIS_MISSING_REQUIRED_ATTRIBUTES;
        } else {
            return translatedLabels.CIS_WITH_REQUIRED_ATTRIBUTES;
        }
    }

    function getRecommendedScoreLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.CIS_MISSING_RECOMMENDED_ATTRIBUTES;
        } else {
            return translatedLabels.CIS_WITH_RECOMMENDED_ATTRIBUTES;
        }
    }

    function getDuplicateScoreLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.DUPLICATE_CIS;
        } else {
            return translatedLabels.NON_DUPLICATE_CIS;
        }
    }

    function getOrphanScoreLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.ORPHAN_CIS;
        } else {
            return translatedLabels.NON_ORPHAN_CIS;
        }
    }

    function getStalenesScoreLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.STALE_CIS;
        } else {
            return translatedLabels.NON_STALE_CIS;
        }
    }

    function getAuditScoreLabel() {
        if (api.state.viewLegacyScores) {
            return translatedLabels.NON_COMPLIANT_CIS;
        } else {
            return translatedLabels.COMPLIANT_CIS;
        }
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
