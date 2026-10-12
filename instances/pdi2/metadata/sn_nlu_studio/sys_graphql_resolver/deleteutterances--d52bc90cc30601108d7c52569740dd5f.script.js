(function process( /*ResolverEnvironment*/ env) {

    try {

        var modelId = env.getArguments().modelId;
        var utteranceIds = env.getArguments().utteranceIds;

        global.NLUUtterance.deleteRecords(modelId, "sys_idIN" + utteranceIds.join(','));

        return {
            status: 'success',
            deletedUtteranceIds: utteranceIds
        };

    } catch (err) {
        return {
            status: 'failure',
            deletedUtteranceIds: null
        };
    }

})(env);
