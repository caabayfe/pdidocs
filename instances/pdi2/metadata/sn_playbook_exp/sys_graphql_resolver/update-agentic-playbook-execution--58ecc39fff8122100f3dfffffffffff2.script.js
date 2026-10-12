(function process( /*ResolverEnvironment*/ env) {

    const args = env.getArguments();
    const activityContextId = args.activityContextId;
    const status = args.status;
	const CANCELLED = "CANCELLED";

    if (!activityContextId) {
        return {
            errorType: "MISSING_ARGUMENT",
            message: gs.getMessage("A required argument is missing or invalid.")
        };
    }
	
    if(status === CANCELLED){
		return  new global.snPlaybookAPI().cancelAiAgentUsecase(activityContextId);
	}else{
		return new global.snPlaybookAPI().markAiAgentRecommendationStatus(activityContextId, status);
	}
		

})(env);
