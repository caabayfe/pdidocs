if (!gs.hasRole("knowledge_manager") && !gs.hasRole("knowledge_admin")) {
    gs.addErrorMessage(gs.getMessage("You do not have permission to execute this job. Only Knowledge Managers and Knowledge Admins can execute Article Optimization jobs."));
    action.setRedirectURL(current);
} else {
    current.update();
    gs.addInfoMessage(gs.getMessage('"{0}" has started.', current.name.getDisplayValue()));
    gs.executeNow(current);
    action.setRedirectURL(current);
}
