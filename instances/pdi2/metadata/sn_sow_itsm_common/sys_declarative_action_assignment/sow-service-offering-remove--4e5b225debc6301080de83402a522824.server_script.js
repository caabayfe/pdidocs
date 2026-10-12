if (!current.service_offering.nil() && String(current.service_offering) === String(current.task.service_offering)) {
	gs.addInfoMessage(gs.getMessage("A task's primary Service offering cannot be removed from Service Offerings related list - change or remove the Service offering from the task form instead"));
} else {
	current.deleteRecord();
}
