function process(context) {
	var answer = new sn_ais.GeniusResultAnswer();

	answer.setTable('sys_user');
	answer.setSearchLimit(2);
	answer.spellCheck(false);
	var queries = [];
	var searchPhrases = [];
	var title;
	var matchingSegments;
	var predictionResult = context.getPredictionResult();
	if (predictionResult && predictionResult.length == 1) {
		var detail = predictionResult[0];
		if (detail['result'] && detail['result']['entities']) {
			var entities = detail['result']['entities'];
			for (var i = 0; i < entities.length; i++) {
				matchingSegments = entities[i]['matchingSegments'];
				if (entities[i]['name'].endsWith('personName')) {
					for (var j = 0; j < matchingSegments.length; j++)
						searchPhrases.push(matchingSegments[j]['value']);
				} else if (entities[i]['name'].endsWith('cityLocation')) {
					if (matchingSegments && matchingSegments.length > 0)
						queries.push('location.nameLIKE' + matchingSegments[0]['value']);
				} else if (entities[i]['name'].endsWith('departmentName')) {
					if (matchingSegments && matchingSegments.length > 0)
						queries.push('department.nameLIKE' + matchingSegments[0]['value']);
				} else if (entities[i]['name'].endsWith('jobTitle')) {
					if (matchingSegments && matchingSegments.length > 0) {
						title = matchingSegments[0]['value'];
						queries.push('titleLIKE' + title);
					}
				}
			}
		}
	}

	if (searchPhrases.length > 0)
		answer.addSearchPhrases(searchPhrases);
	else if (title)
		answer.setSearchPhrase(title);

	if (queries.length > 0)
		answer.setEncodedQuery(queries.join('^'));

	return answer;
}
