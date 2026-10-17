(function executeRule(current, previous /*null when async*/ ) {

    var processConfigUtil = new global.ProminProcessConfigUtil();
    var processDef = current.getValue("process_def");
    var field = current.getValue("field");
    var view = current.getValue("view");

    //Validate user has write access on process config
    var grProcessConfig = current.process_def.getRefRecord();
    if (!grProcessConfig.canWrite()) {
        gs.addErrorMessage(gs.getMessage("You do not have permission to create this record"));
        current.setAbortAction(true);
		action.setRedirectURL(current);
        return;
    }

    //validate if field is duplicate
    if (processConfigUtil.isActivityFieldDuplicate(processDef, field, current.getValue("sys_id"))) { 
        gs.addErrorMessage(gs.getMessage("Field '{0}' is already saved in one of the perspective", [field]));
        current.setAbortAction(true);
		action.setRedirectURL(current);
    }
    //validate field limit for perspective
    if (current.operation() == "insert" && !processConfigUtil.isPerspectiveFieldLimitValid(processDef, view)) {
        gs.addErrorMessage(gs.getMessage("Perspective {0} already has max allowed number of fields", [current.getDisplayValue("view")]));
        current.setAbortAction(true);
		action.setRedirectURL(current);
    }

})(current, previous);
