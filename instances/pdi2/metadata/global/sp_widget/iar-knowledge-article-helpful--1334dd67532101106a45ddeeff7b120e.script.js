data.tsQueryId = $sp.getParameter("sysparm_tsqueryId") || "";
data.recommendationId = $sp.getParameter("recommendation_id") + "" || "";
data.rating = 0;
options.kb_rating_style = options.kb_rating_style ? options.kb_rating_style == "true" : false;
data.isMESP = ($sp.getParameter("id") == "me_kb_view") || false;
data.closeRequestChoices = {
    CLOSE_REQUEST: "close",
    KEEP_OPEN: "open"
};

data.aisFeedBack = {
	HELPFUL: AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE,
	NOT_HELPFUL: AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_NEGATIVE,
};

var taskGr;

if (!input) {
    getSystemProperties();
    data.messages = {};
    data.messages.HELPFUL = gs.getMessage("Helpful?");
    data.messages.HELPFUL_GROUP = gs.getMessage("Was this article helpful?");
    data.messages.HELPFUL_YES = gs.getMessage("Yes,this article was helpful");
    data.messages.HELPFUL_NO = gs.getMessage("No,this article was not helpful");
    data.messages.THANKYOU_RATING = gs.getMessage("Thank you for the feedback.");

    var recommendation = AutoResolutionPortalHelper.getRecommendationDetails(data.recommendationId);
    data.canView = false;
    if (recommendation) {
        AutoResolutionPortalHelper.markRecommendationAsViewed(data.recommendationId);
        data.feedbacksubmitted = recommendation.isFeedbackSubmitted;
        data.isOptedOut = recommendation.isOptedOut;
        data.canView = recommendation.canView;
        if (recommendation.task) {
            taskGr = recommendation.task;
            data.task = {};
            data.task.id = taskGr.getUniqueValue();
            data.task.table = taskGr.getValue("sys_class_name");
            data.task.number = taskGr.getValue("number");

            var redirectToPage = "";
            if (AutoResolutionPortalHelper.checkStandardTicketConfig(data.task.table))
                redirectToPage = "standard_ticket";
            else
                redirectToPage = "form";

            data.task.link = '?id=' + redirectToPage + '&table=' + data.task.table + '&sys_id=' + data.task.id;
        }

    }

}

if (input) {
    var successMessage;
    var kbPortal;
    if (input.action == "saveHelpful") {
        data.response = options.response || gs.getMessage('Thank you');
        kbPortal = new sn_km_portal.KBPortalService();
        var params = {};
        params.article = input.article_sys_id;
        params.useful = (input.useful == 'useful_yes') ? 'yes' : 'no';
        params.user = gs.getUserID();
        params.session_id = gs.getSessionID();
        params.search_id = data.tsQueryId;
        var resp = kbPortal.saveUsefulWithParams(params) + '';
        successMessage = options.feedback_message ? options.feedback_message : gs.getMessage('Thank you for the feedback.');
        data.response = resp.includes('true') ? successMessage : gs.getMessage('You have reached the daily limit for comments posted by a user.');
        data.success = resp.includes('true');
        data.helpfulresp = resp;
    } else if (input.action == 'submitFeedback') {
        if (input.aisFeedBack == data.aisFeedBack.HELPFUL) {
            new AutoResolutionAISearchHelper.updateResultLineItemFeedback(data.recommendationId, data.aisFeedBack.HELPFUL, "Helpful", true);
        } else if (input.aisFeedBack == data.aisFeedBack.NOT_HELPFUL) {
            new AutoResolutionAISearchHelper.updateResultLineItemFeedback(data.recommendationId, data.aisFeedBack.NOT_HELPFUL, "", true);
        }
        gs.addInfoMessage(gs.getMessage('Thank you for your feedback.'));
    } else if (input.action == 'closeRequest') {
        //gettting task details from recommendationId
        var taskDetails = AutoResolutionPortalHelper.getTaskFromRecommendation(data.recommendationId);
        taskGr = new GlideRecord(taskDetails.table);
        taskGr.get(taskDetails.id);
        // submit feedback
        if (taskGr.isValidRecord()) {
            var aisResultsHelpfulList = [];
            var feedbackRequest = {};
            //aisResultsHelpfulList.push(data.recommendationId);
            feedbackRequest.aisHelpful = AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE;
            feedbackRequest.closeRequest = data.closeRequestChoices.CLOSE_REQUEST;
            feedbackRequest.aisResultsList = aisResultsHelpfulList;
			
            var result = new AutoResolutionPortalHelper(taskGr).submitFeedback(feedbackRequest);
            if (result.status == "success") {
                gs.addInfoMessage(gs.getMessage("Your request has been closed."));
            } else {
                if (result.error) {
                    gs.addErrorMessage(result.error);
                } else {
                    gs.addErrorMessage(gs.getMessage("Could not submit feedback. An unknown error occurred."));
                }
            }
        }
    } else if (input.action == 'getHelpful') {
        data.percent = getPercent();
        data.helpfulContent = gs.getMessage("{0}% found this helpful", data.percent + '');
    } else if (input.action === 'submit_rating') {
        kbPortal = new sn_km_portal.KBPortalService();
        data.response = kbPortal.submitRating(input.rating, input.article_id);
    } else if (input.action === 'IAROptout') {
        var task = AutoResolutionPortalHelper.getTaskFromRecommendation(data.recommendationId);
        var taskGr = AutoResolutionTaskDataBroker.getTaskRecord(task.table, task.id);

        if (!gs.nil(taskGr)) {
            var isTaskAssignedToBotUser = new AutoResolutionTaskHelper().isTaskAssignedToBotUser(taskGr);
            if (isTaskAssignedToBotUser) {
                var result = new AutoResolutionPortalHelper(taskGr).unassignTask();

                if (result.status == "success") {
                    gs.addInfoMessage(gs.getMessage("Thank you for your feedback. We've reassigned your request and an agent should reach out to your shortly."));
                } else {
                    data.error = true;
                    gs.addErrorMessage(result.error);
                }
            }
        }
    }
}

function getPercent() {
    var fbs = new GlideRecord("kb_feedback");
    fbs.addQuery("useful", "yes");
    fbs.addQuery("article", input.article_sys_id);
    fbs.query();
    var useful_yes = fbs.getRowCount();
    fbs = new GlideRecord("kb_feedback");
    fbs.addNotNullQuery("useful");
    fbs.addQuery("article", input.article_sys_id);
    fbs.query();
    var useful_total = fbs.getRowCount();

    var percentage = (useful_total > 0) ? Math.round(useful_yes / useful_total * 100) : 0;
    return percentage;
}

function getSystemProperties() {
    data.actionablefeedback_helpful_enabled = gs.getProperty('glide.knowman.feedback.enable_actionable_feedback_for_helpful', 'false');
    data.rating_threshold = gs.getProperty('glide.knowman.feedback.enable_actionable_feedback_for_rating', "");
    data.show_helpful = gs.getProperty('glide.knowman.show_yn_rating', 'true');
}
