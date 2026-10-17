(function() {
    var p = {};
    p = options;
    p.auto_redirect = "false";
    data.catalogsubmitted = false;
    data.recommendationId = String($sp.getParameter("recommendation_id")) || "";

    if (!input) {
        var recommendation = AutoResolutionPortalHelper.getRecommendationDetails(data.recommendationId);
        data.canView = false;
        if (recommendation) {
            AutoResolutionPortalHelper.markRecommendationAsViewed(data.recommendationId);
            data.feedbacksubmitted = recommendation.isFeedbackSubmitted;
            data.isOptedOut = recommendation.isOptedOut;
            data.canView = recommendation.canView;
			
            data.task = {}
            data.task.id = recommendation.task.getUniqueValue();
            data.task.table = recommendation.task.getTableName();
            data.task.number = recommendation.task.getValue("number");
            var redirectToPage = AutoResolutionPortalHelper.checkStandardTicketConfig(data.task.table)
                ? "standard_ticket" : "form";
            data.task.link = '?id=' + redirectToPage + '&table=' + data.task.table + '&sys_id=' + data.task.id;
        }
    }

    if (input) {
        if (input.action === 'postProcessing') {
            data.catalogsubmitted = true;
            var redirectToPage = "";
            var generatedTable = input.catalogTable;
            var generatedId = input.catalogSysId;
			
			
            //If task have catalog item request submitted then set catalog related info
            if (generatedId && generatedTable) {	
                AutoResolutionPortalHelper.markRecommendationAsSubmitted(data.recommendationId, generatedTable, generatedId);
                var catalogGr = new GlideRecord(generatedTable);
                catalogGr.get(generatedId);

                var isScRequest = false;
                if (generatedTable == "sc_request")
                    isScRequest = true;
                else {
                    var scTables = new TableUtils('sc_request').getTableExtensions();
                    isScRequest = scTables.indexOf(generatedTable) >= 0;
                }

                //Set redirect page id
                if (isScRequest)
                    redirectToPage = "sc_request";
                else if (AutoResolutionPortalHelper.checkStandardTicketConfig(generatedTable))
                    redirectToPage = "standard_ticket";
                else
                    redirectToPage = "form";

                data.scChild = {};
                data.scChild.id = generatedId;
                data.scChild.table = generatedTable;
                data.scChild.number = catalogGr.getValue("number");
                data.scChild.link = '?id=' + redirectToPage + '&table=' + data.scChild.table + '&sys_id=' + data.scChild.id;
            }


            var taskDetails = AutoResolutionPortalHelper.getTaskFromRecommendation(data.recommendationId);
            if (taskDetails) {
                data.task = {};
                data.task.id = taskDetails.id;
                data.task.table = taskDetails.table;

                var taskGr = AutoResolutionTaskDataBroker.getTaskRecord(data.task.table, data.task.id);
				
                data.task.number = taskGr.getValue("number");

                redirectToPage = "";
                if (AutoResolutionPortalHelper.checkStandardTicketConfig(data.task.table))
                    redirectToPage = "standard_ticket";
                else
                    redirectToPage = "form";

                data.task.link = '?id=' + redirectToPage + '&table=' + data.task.table + '&sys_id=' + data.task.id;

                data.slaTimeLeft = AutoResolutionPortalHelper.getSLATimeLeft(data.task.id);
            }
        } else if (input.action === 'IAROptout') {
            var task = AutoResolutionPortalHelper.getTaskFromRecommendation(data.recommendationId);
            if (task) {
				
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
    }

    data.catalogItem = $sp.getWidget("widget-sc-cat-item-v2", p);
})();
