(function process(/*ResolverEnvironment*/ env) {

    const args = env.getArguments();
    const activityContextId = args.activityContextId;

    if (!activityContextId) {
        return {
            errorType: "MISSING_ARGUMENT",
            message: gs.getMessage("A required argument is missing or invalid.")
        };
    }

    // Starts the agentic conversation as the current session user (the clicker).
	return new global.snPlaybookAPI().initiateAiAgentUsecase(activityContextId);


})(env);
