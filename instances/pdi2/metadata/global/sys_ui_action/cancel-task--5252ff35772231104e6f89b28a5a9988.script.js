var isTaskCancelled = SNC.ProcessOptimization.cancelScheduledTask(current.getUniqueValue());
if (isTaskCancelled) {
	gs.addInfoMessage(gs.getMessage("Scheduled task is cancelled"));
} else {
	gs.addErrorMessage(gs.getMessage("Unable to cancel scheduled task"));
}
