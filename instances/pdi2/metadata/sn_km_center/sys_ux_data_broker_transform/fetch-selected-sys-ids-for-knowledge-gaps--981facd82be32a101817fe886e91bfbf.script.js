function transform(input) {
	var query = input.selectionQuery ? `${input.selectionQuery}^${input.query}` : input.query;
	var result = new sn_km_gen_ai.KnowledgeGap().areSysIdsInSameCluster(query, input.action);
	switch (input.action) {
		case 'report_knowledge_gap':
			result["errorMsg"] = [result["errorMsg"]];
			return result;
		case 'create_article':
			// for create article, we potentially may return more than 1 error message
			var checkCreatedMsg = new sn_km_gen_ai.KnowledgeGap().checkIfArticlesCreated(query);
			if (checkCreatedMsg) {
				result["errorMsg"] = result["errorMsg"] ? [result["errorMsg"], checkCreatedMsg] : [checkCreatedMsg];
				result["status"] = false;
			} else {
				result["errorMsg"] = [result["errorMsg"]];
			}
			return result;
	}
}
