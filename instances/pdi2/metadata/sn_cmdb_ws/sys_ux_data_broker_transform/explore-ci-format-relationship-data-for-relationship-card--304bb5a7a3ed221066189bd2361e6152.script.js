function transform(input) {
	let relScoreResults = input.relScore.result;
	let duplicateCount = 0;
	let staleCount = 0;
	let relationships = {};
	let relationshipsCount = 0;

	for (let i = 0; i < relScoreResults.length; i++) {
		let metric = relScoreResults[i].metric;
		if (metric === "REL_DUPLICATE")
			duplicateCount = relScoreResults[i].value;
		else if (metric === "REL_STALE") 
			staleCount = relScoreResults[i].value;
	}
	try {
		relationships = JSON.parse(input.relData.result.relations);
		for (let i = 0; i < relationships.relations.length; i++) {
			relationshipsCount += relationships.relations[i].relations.length;
		}
	}
	catch(e) {
		relationships = {};
		relationshipsCount = 0;
	}
	
	return {
		duplicateCount: duplicateCount ? duplicateCount.toString() : "0",
		staleCount: staleCount ? staleCount.toString() : "0",
		relationshipsCount: relationshipsCount ? relationshipsCount.toString() : "0"
	};
}
