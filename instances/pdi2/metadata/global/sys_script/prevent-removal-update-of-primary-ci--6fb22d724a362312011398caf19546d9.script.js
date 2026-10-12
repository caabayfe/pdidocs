if (current.operation() == 'delete' && !current.ci_item.nil() && current.ci_item == current.task.cmdb_ci) {
   gs.addInfoMessage(gs.getMessage("A task's primary CI cannot be removed from Affected CIs - change or remove the CI from the task form instead"));
   current.setAbortAction(true);
} else if (current.operation() == 'update' && current.ci_item.changes() && !current.task.cmdb_ci.nil() && previous.ci_item == current.task.cmdb_ci) {
   gs.addInfoMessage(gs.getMessage('Task/CI relationship cannot be changed because CI is the primary CI on the associated task - change or remove the CI from the task form instead'));
   current.setAbortAction(true);
}
