try {
	var mlHelper = new global.AutoResolutionMLHelper(current.getUniqueValue());
	mlHelper.cancelAllTrainingJobs();
} catch(ex) {
	
}
finally {
	mlHelper.toggleScheduleJobActive(false);
}

current.update();
