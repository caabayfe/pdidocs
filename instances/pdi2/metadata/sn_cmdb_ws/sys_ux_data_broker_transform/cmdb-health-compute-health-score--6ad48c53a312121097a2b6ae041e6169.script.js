function transform(input) {
	var scores = input.scores;
	var result = {};

	var legacyScoreUtil = new sn_cmdb_ws.CMDBWsHealthDashboardLegacyUtil();

	var completeness = {};
	var correctness = {};
	var compliance = {};

	if (legacyScoreUtil.legacyScoresAllowed()) {
		// The 100 - keeps it consistent with the new way we are storing scores.
		// On the UIB page we will format all the numbers the same way.
		if (scores.completenessScore && scores.completenessScore.length > 0) {
			var legacyCompletenessScore = legacyScoreUtil.getLegacyScore(scores.completenessScore);
			completeness = legacyScoreUtil.formatMetric(legacyCompletenessScore[0], 100 - legacyCompletenessScore[0].legacy_score);
		}
		if (scores.correctnessScore && scores.correctnessScore.length > 0) {
			var legacyCorrectnessScore = legacyScoreUtil.getLegacyScore(scores.correctnessScore);
			correctness = legacyScoreUtil.formatMetric(legacyCorrectnessScore[0], 100 - legacyCorrectnessScore[0].legacy_score);
		}		
		if (scores.complianceScore && scores.complianceScore.length > 0) {
			var legacyComplianceScore = legacyScoreUtil.getLegacyScore(scores.complianceScore);
			compliance = legacyScoreUtil.formatMetric(legacyComplianceScore[0], 100 - legacyComplianceScore[0].legacy_score);
		}
	} else {
		if (scores.completenessScore && scores.completenessScore.length > 0) {
			completeness = legacyScoreUtil.formatMetric(scores.completenessScore[0], roundScore((scores.completenessScore[0].failed  / scores.completenessScore[0].total) * 100));
		}
		if (scores.correctnessScore && scores.correctnessScore.length > 0) {
			correctness = legacyScoreUtil.formatMetric(scores.correctnessScore[0], roundScore((scores.correctnessScore[0].failed  / scores.correctnessScore[0].total) * 100));
		}
		if (scores.complianceScore && scores.complianceScore.length > 0) {
			compliance = legacyScoreUtil.formatMetric(scores.complianceScore[0], roundScore((scores.complianceScore[0].failed  / scores.complianceScore[0].total) * 100));
		}
	}

	result = {
		'completeness': completeness,
		'correctness': correctness,
		'compliance': compliance
	};

	return result;

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
