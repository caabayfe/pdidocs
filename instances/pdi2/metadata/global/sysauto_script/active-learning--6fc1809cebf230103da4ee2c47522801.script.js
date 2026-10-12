var solutionName = new ActiveLearningIntegrator().train();
if (solutionName == null) {
	gs.info("Could not trigger Active Learning scheduled job");
}
else {
	gs.info("Active Learning scheduled job is triggered with solution name: ".concat(solutionName));
}
