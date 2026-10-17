(function() {

    var localinput = input;
    data.error = false;

    if (options && options.recordId && options.recordTable) {
        data.recordId = options.recordId;
        data.recordTable = options.recordTable;
        data.isCatalogSubmitted = options.isCatalogSubmitted;
        data.action = options.action;
    } else {
        data.recordTable = $sp.getParameter('table');
        data.recordId = $sp.getParameter('sys_id');
        data.isCatalogSubmitted = false;
    }

    if (!data.recordTable || !data.recordId)
        return;

    if (localinput && localinput.action == 'iar_optout') {		
        var taskGr = AutoResolutionTaskDataBroker.getTaskRecord(data.recordTable, data.recordId);
       
        if (!gs.nil(taskGr)) {
            var isTaskAssignedToBotUser = new AutoResolutionTaskHelper().isTaskAssignedToBotUser(taskGr);
            if (!isTaskAssignedToBotUser)
                return;

            var result = new AutoResolutionPortalHelper(taskGr).unassignTask();

            if (result.status == "success") {
                gs.addInfoMessage(gs.getMessage("Thank you for your request. An agent will reach out to you shortly."));
            } else {
                data.error = true;
                gs.addErrorMessage(result.error);
            }
        }
    }

})();
