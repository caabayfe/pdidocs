function runSetupEvaluator() {
	var JOB_ID = 'b9a317e9533130106b86ddeeff7b12cd';	
	new sn_itam_recomm.ImportantActionUtils().runEvaluatorOnDashboardsWithJob(JOB_ID);
	new sn_itam_recomm.ImportantActionUtils().checkAndDeleteResultsForRealTimeWorkspace();
}

runSetupEvaluator();
