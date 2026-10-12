if (!current.ci_item.nil() && String(current.ci_item) === String(current.task.cmdb_ci)) {
    gs.addInfoMessage(gs.getMessage("A task's primary CI cannot be removed from Affected CIs - change or remove the CI from the task form instead"));
} else {
    if (current.deleteRecord()) {
        gs.addInfoMessage(gs.getMessage("Affected CI {0} is removed successfully", [current.ci_item.name]));
    } else {
        gs.addInfoMessage(gs.getMessage("Unable to remove Affected CI {0}", [current.ci_item.name]));
    }
}
