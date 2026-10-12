(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var currentTable = request.body.data.currentTable;
    var currentId = request.body.data.currentId;
    var resourceTable = request.body.data.resourceTable;
    var resourceId = request.body.data.resourceId;
    var allActions = request.body.data.allActions;
    var actions = [];
    var uniqueActions = [];

    var sau = new SNC.SearchActionUtils();
    //PRB1367764: Treat answer as a question to pass the check that the actions exist
    if (resourceTable === 'kb_social_qa_answer') {
        resourceTable = 'kb_social_qa_question';
    }

    if (sau.loadRecords(currentTable, currentId, resourceTable, resourceId)) {
        for (var i = 0; i < allActions.length; i++) {
            var currentCondition = allActions[i].currentActionCondition;
            var resourceCondition = allActions[i].actionCondition;

			if (allActions[i].sysId) {
				if (sau.checkVisibility(allActions[i].sysId)) {
					actions.push(allActions[i].actionId);
					uniqueActions.push(allActions[i].sysId);
				}
			} else {
				if (sau.checkVisibilityPreOrlandoOnly(currentTable, currentCondition, resourceTable, resourceCondition)) {
					actions.push(allActions[i].actionId);
					uniqueActions.push(allActions[i].sysId);
				}
      }
        }
    }

    var body = {};
    body.succeed = true;
    //itemId not used since Orlando. Leaving it here only to serve backward compatibility for pre-Orlando to Orlando upgrade.
    body.itemId = resourceTable + ':' + resourceId;
    //keeping this for backwards compatibility
    body.actions = actions;
    body.uniqueActions = uniqueActions;
    response.setBody(body);
})(request, response);
