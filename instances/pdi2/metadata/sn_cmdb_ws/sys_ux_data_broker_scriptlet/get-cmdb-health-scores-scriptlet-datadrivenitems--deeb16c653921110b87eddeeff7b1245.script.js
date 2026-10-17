function transform(input) {
	var outputHealthScores = {};
	
	var completenessScore = input.completenessScore.result;
	var complianceScore = input.complianceScore.result;
	var correctnessScore = input.correctnessScore.result;

	outputHealthScores = {
		'completenessScore': completenessScore,
		'complianceScore': complianceScore,
		'correctnessScore': correctnessScore
	};
	
	return outputHealthScores;
}
