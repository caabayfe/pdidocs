(function executeRule(current, previous /*null when async*/) {

	new CommunicationPlanEngine(current).attachPlans();

})(current, previous);
