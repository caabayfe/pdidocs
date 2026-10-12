(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage("The Clustering Solution Definition: '{0}' is based on '{1}' table hence cannot be attached to '{2}' process configuration", [current.clustering_solution_def.getDisplayValue(), current.clustering_solution_def.table, current.table]));
    current.setAbortAction(true);
    gs.setRedirect(current);
})(current, previous);
