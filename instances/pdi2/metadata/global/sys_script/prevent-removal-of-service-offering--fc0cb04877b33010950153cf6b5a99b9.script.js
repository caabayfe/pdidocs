if (current.operation() === 'delete' && !current.service_offering.nil() && String(current.service_offering) === String(current.task.service_offering)) {
    gs.addInfoMessage(gs.getMessage("A task's primary Service offering cannot be removed from Service Offerings related list - change or remove the Service offering from the task form instead"));
	current.setAbortAction(true);
 } else if (current.operation() === 'update' && current.service_offering.changes() && !current.task.serice_offering.nil() && String(previous.service_offering) === String(current.task.service_offering)) {
   gs.addInfoMessage(gs.getMessage('Task/Service offering relationship cannot be changed because Service offering is the primary Service offering on the associated task - change or remove the Service offering from the task form instead'));
 current.setAbortAction(true);
 }
