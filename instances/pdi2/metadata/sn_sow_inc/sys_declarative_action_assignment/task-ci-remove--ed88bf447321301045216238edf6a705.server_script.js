if (!current.ci_item.nil() && String(current.ci_item) === String(current.task.cmdb_ci)) {
	gs.addInfoMessage(gs.getMessage("A task's primary CI cannot be removed from Affected CIs - change or remove the CI from the task form instead"));
} else {
	current.deleteRecord();
}
