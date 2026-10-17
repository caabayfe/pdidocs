((function WriteBackAction(parm_input, parm_variable) {
    var actionValue = getRatingValueString(parm_variable.rating_value);
    var sourceTable = parm_variable.table;
    var cardType = parm_variable.model;
    var labelDescription = parm_variable.name;
    var resultSysId = parm_variable.result_id;
    var sessionId = gs.getSessionID();
    var userId = gs.getUserID();
    var actionType = "Feedback";
    var source = "Mobile";
    var actionId = getActionId(cardType,parm_variable.rating_value);
    var aisDocId = sourceTable + "_" + resultSysId;

    try {
        var searchContext = actionContext.RefreshContext.SearchContext;
        if (!searchContext) throw new Error("SearchContext not found");

        var searchContextConfigId = searchContext.ConfigId;
        var queryTerm = searchContext.SearchTerm;

        var payload = {
            actionId: actionId,
            actionType: actionType,
            actionValue: actionValue,
            searchContextConfigId: searchContextConfigId,
            queryTerm: queryTerm,
            resultSysId: resultSysId,
            aisDocId: aisDocId,
            sourceTable: sourceTable,
            cardType: cardType,
            labelDescription: labelDescription,
            source: source,
            sessionId: sessionId,
            timestamp: Date.now(),
            userId: userId
        };

        new global.MobileGlideSignalsService().trackGeniusResultEventAsync(payload);
        gs.addInfoMessage(gs.getMessage("Thanks for your feedback"));
    } catch (e) {
        gs.error("Feedback error: " + e);
        gs.addErrorMessage(gs.getMessage("Feedback encountered an error"));
    }
})(parm_input, parm_variable));

function getActionId(cardType, ratingValue) {
    var actionString = 'cancelled';
    if (ratingValue == 1)
        actionString = 'positive';
    else if (ratingValue == 2)
        actionString = 'negative';

    return cardType + "_" + actionString + "_feedback";
}

function getRatingValueString(ratingValue) {
    if (ratingValue == 1) return 'Helpful';
    if (ratingValue == 2) return 'Not Helpful';

    return 'Cancelled';
}

// Feedback icon names are 'Thumbs-up' and 'Thumbs-down'
function markRatingIconAlternativeText() {
    gs.getMessage("Helpful");
    gs.getMessage("Not helpful");
}
