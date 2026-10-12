try {
	SNC.ProcessOptimization.executeScheduledJob(current.getUniqueValue());
}catch (error){
	gs.error(error.getMessage());
}
