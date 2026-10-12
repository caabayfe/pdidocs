/**
 * Fetches and transforms health score data for the Knowledge Center homepage.
 * Retrieves the knowledge base health score and its corresponding display color.
 * @param {Object} input - Input parameters (currently unused)
 * @returns {Object} Formatted scores object containing knowledgeBaseHealth with score and color
 */
function transform(input) {
	// Fetch the knowledge base health score using KnowledgeBaseHealthScoreUtil
	var kbScore = (new sn_km_center.KnowledgeBaseHealthScoreUtil()).calculateWeightedAverageForUserKnowledgeBases().weightedAverage;
	// Get the corresponding color for the score
	var color = (new sn_km_center.HealthScoreColorUtils()).getHealthScoreColor(kbScore);
	var formattedScores = {
		knowledgeBaseHealth : {
			score: kbScore,
			color: color
		}
	};
	return formattedScores;
}
