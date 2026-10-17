(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const data = request.body.data;
    const {deltaSysId, sysId, filterInPublishedDecisions, answerTable, fromIndex, resultsCount, filterPatternConfig} = data;

    const result = new sn_decision_table.DecisionQuestionRepository().filterDecisions(sysId, deltaSysId, filterInPublishedDecisions, answerTable, fromIndex, resultsCount, filterPatternConfig);

	return result;
})(request, response);
