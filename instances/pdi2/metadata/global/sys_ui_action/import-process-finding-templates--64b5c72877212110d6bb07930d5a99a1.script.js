try {
    var findingDef = new global.ProminFindingDefUtil();
    var parentTable = getParentTable(current.getUniqueValue());
    if (!findingDef.isProcessConfig(current)) {
        gs.addInfoMessage(gs.getMessage("No process configuration available for {0} table. Please contact your admin/power user to create a process configuration.", [parentTable]));
    } else if (!findingDef.isProcessRegularFindingPresent(current) && !findingDef.isProcessAutomatedFindingPresent(current)) {
        var linkLabel = gs.getMessage("process configuration");
        var link = '<a href="' + getProcessConfigLink(parentTable) + '" target="_blank">' + parentTable + ' ' + linkLabel + '</a>';
        gs.addInfoMessage(gs.getMessage("No finding definitions available for {0}. Please contact your admin/power user to create finding definitions.", [link]));
    } else {
        var responseJson = SNC.ProcessOptimization.copyProcessFindingToProject(current.getUniqueValue());
        var response = JSON.parse(responseJson);
        if (!gs.nil(response.success) && response.success.length > 0) {
            var successMessage = response.success.join(", <br>");
            gs.addInfoMessage(successMessage);
        }
        if (!gs.nil(response.warning) && response.warning.length > 0) {
            var warnMessage = response.warning.join(", <br>"); 
            gs.addInfoMessage(warnMessage); 
        }
        if (!gs.nil(response.error) && response.error.length > 0) {
            var errorMessage = response.error.join(", <br>");
            gs.addInfoMessage(errorMessage);
        }
		if (!gs.nil(response.limit_exceeded) && response.limit_exceeded.length > 0) {
            var limitExceededMessage = response.limit_exceeded.join(", <br>");
            gs.addInfoMessage(limitExceededMessage);
        }
    }
} catch (error) {
    gs.addErrorMessage(error.getMessage());
}
action.setRedirectURL(current);

function getParentTable(projectId) {
    var grEntity = new GlideRecord("promin_project_entity");
    grEntity.addQuery("project", projectId);
    grEntity.addNullQuery("parent_entity");
    grEntity.query();
    var entityCount = grEntity.getRowCount();
    var table = "";
    if (entityCount == 1 && grEntity.next()) {
        table = grEntity.getValue("table");
    }
    return table;
}

function getProcessConfigLink(tableName) {
    var grProcessDef = new GlideRecord("promin_process_def");
    grProcessDef.addQuery("table", tableName);
	grProcessDef.addQuery("content_pack", false);
    grProcessDef.query();
    if (grProcessDef.next()) {
        return grProcessDef.getLink();
    }
}
