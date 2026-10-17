function transform(input) {
    var results = input.geniusResults;
    if (!results)
        return null;
    var citationsresult = {};
    results.items.forEach(function(geniusResultCard) {
        if (!geniusResultCard.propValues.citations)
            return;
        var citations = JSON.parse(geniusResultCard.propValues.citations);

        var clickActions = geniusResultCard.propValues.actions;
        if (!clickActions)
            return;
        var citationModArray = {};
        var viewArticleAction = {};
        var actionToAdd = {};
        clickActions.forEach(function(action) {
            if (action.name === 'view_article') {
                actionToAdd = action;
            }
        });

        citations.forEach(function(citation) {
            var citationActionPayload = {
                'table': citation.table,
                'sys_id': citation.sys_id,
                'url': citation.url
            };
            actionToAdd.actionPayload = Object.assign({}, citationActionPayload);
            citation.action = Object.assign({}, actionToAdd);
        });

        var citationspart2 = citations;
        geniusResultCard.propValues.citations = JSON.stringify(citationspart2);

    });
    return results;

}
