(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const data = request.body.data;
    const decisionTableDetails = data.decisionTableDetails;
    const targetIndex = data.targetIndex;
    const targetDecisionDetails = data.targetDecisionDetails;
    const isIncrementOnly = data.isIncrementOnly;
    const previousOrderInClient = data.previousOrderInClient;

    const order = new sn_decision_table.DecisionQuestionRepository().accommodateReorderedDecision({
        decisionTableDetails,
        targetIndex,
        targetDecisionDetails,
        isIncrementOnly,
        previousOrderInClient
    });
    response.setBody({
        order
    });
    response.setStatus(200);

})(request, response);
