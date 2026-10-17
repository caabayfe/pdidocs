(function process( /*ResolverEnvironment*/ env) {

    var args = env.getArguments();

    var targetIntentId = args.targetIntentId;
    var srcIntentId = args.srcIntentId;
    var utteranceIds = args.utteranceIds;
    var entityIds = args.entityIds;

    var result = global.NLUUtterance.moveUtterancesToIntent(
        srcIntentId, targetIntentId, utteranceIds, entityIds
    );

    return result;

})(env);
