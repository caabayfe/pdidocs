(function() {

    var msg = data.messages = {};
    msg.title = gs.getMessage('Recommendations');
    data.recordId = $sp.getParameter("sys_id");
    data.recordTable = $sp.getParameter("table");
    data.action = $sp.getParameter("action");

    if (!data.recordId || !data.recordTable) {
        gs.addErrorMessage(gs.getMessage("Table name or record sys_id is missing"));
        return;
    }

    data.recommendations = [];

    data.resultType = {
        CATALOG_ITEM: "sc_cat_item",
        KNOWLEDGE_ARTICLE: "kb_knowledge"
    };

    data.categoryLabel = {
        "sc_cat_item": "Request form",
        "kb_knowledge": "Article"
    };

    data.resultStatus = {
        VIEWED: "viewed",
        SUBMITTED: "submitted"
    };

    var taskGr = AutoResolutionTaskDataBroker.getTaskRecord(data.recordTable, data.recordId);
    if (gs.nil(taskGr)) {
        gs.addErrorMessage(gs.getMessage("Task not found"));
        return;
    }

    data.showOptOutWidget = new AutoResolutionTaskHelper().isTaskAssignedToBotUser(taskGr);

    var result = new AutoResolutionPortalHelper(taskGr).getRecommendationsForTask();
    if (result.status == "failure") {
        gs.addErrorMessage(result.error);
        return;
    }

    data.recommendations = result.recommendations;
    data.showFeedback = !result.isFeedbackSubmitted;
    data.isCatalogSubmitted = result.isCatalogSubmitted;

    var feedbackOption = {};
    feedbackOption.aisResultList = data.recommendations;
    feedbackOption.recordId = data.recordId;
    feedbackOption.recordTable = data.recordTable;
    feedbackOption.isCatalogSubmitted = data.isCatalogSubmitted;
    feedbackOption.action = data.action;

    var optOutOption = {};
    optOutOption.recordId = data.recordId;
    optOutOption.recordTable = data.recordTable;
    optOutOption.isCatalogSubmitted = data.isCatalogSubmitted;
    optOutOption.action = data.action;

    data.feedbackwidget = $sp.getWidget("iar_feedback", feedbackOption);
    data.optOutWidget = $sp.getWidget("iar_optout", optOutOption);

    if (data.isCatalogSubmitted)
        data.slaTimeLeft = AutoResolutionPortalHelper.getSLATimeLeft(data.recordId);
	
	data.isMobile = gs.isMobile();
})();
