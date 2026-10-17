function transform(params) {
	// fetch the knowledge base specific health score data.
	var kbScore = 0;
	var knowledgeBase = params.knowledgeBase;
	if(knowledgeBase === 'All') {
        kbScore = (new sn_km_center.KnowledgeBaseHealthScoreUtil()).calculateWeightedAverageForUserKnowledgeBases().weightedAverage;
    } else {
        kbScore = (new sn_km_center.KnowledgeBaseHealthScoreUtil()).fetchKnowledgeBaseHealthScore(knowledgeBase);
    }
	var color = (new sn_km_center.HealthScoreColorUtils()).getHealthScoreColor(kbScore);
	var formattedScores = {
		knowledgeBaseHealth : {
			score: kbScore,
			color: color
		}
	};
	return formattedScores;
}
