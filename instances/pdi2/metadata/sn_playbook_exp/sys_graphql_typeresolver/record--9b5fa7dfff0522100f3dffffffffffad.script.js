(function process(/*TypeResolutionEnvironment*/ env) {
    var obj = env.getObject();

    if (!gs.nil(obj.errorType)) {
        return 'AgenticPlaybookError';
    }

    return 'UpdateAgenticPlaybookActivityExecutionPayload';
})(env);
