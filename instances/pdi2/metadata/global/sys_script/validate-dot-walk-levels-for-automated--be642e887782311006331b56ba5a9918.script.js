(function executeRule(current, previous /*null when async*/ ) {

    var fieldValue = current.field;
    if (fieldValue.contains(".")) {
        var limit = gs.getProperty("promin.limit.max_activity_dot_walk_levels", 3);
        var field = fieldValue.split(".");
        var levels = field.length;
        if (levels > parseInt(limit)) {
            gs.addErrorMessage(gs.getMessage("The limit for dot walking in field is {0} levels e.g. CI.BusinessService.assignment group", limit));
            current.setAbortAction(true);
            action.setRedirectURL(current);
        }
    }

})(current, previous);
