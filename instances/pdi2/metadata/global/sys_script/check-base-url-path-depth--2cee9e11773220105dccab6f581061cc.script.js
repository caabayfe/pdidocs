(function executeRule(current, previous /*null when async*/) {
	var baseUrl = current.path;
    var baseUrlParts = baseUrl.split('/');
    var maxDepth = UxFrameworkScriptables.getMaxDepthForBaseURLPath();
    if (baseUrlParts.length > maxDepth){
        gs.addErrorMessage(gs.getMessage('The URL path exceeds allowed max depth of {0}', maxDepth));
        current.setAbortAction(true);
    }
})(current, previous);
