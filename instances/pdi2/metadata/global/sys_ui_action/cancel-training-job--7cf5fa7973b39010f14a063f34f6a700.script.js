try {
	var mlHelper = new AutoResolutionMLHelper(current.getUniqueValue());
	mlHelper.cancelAllTrainingJobs();
} catch(ex) {
	
}
finally {
	mlHelper.toggleScheduleJobActive(false);
}

current.update();
