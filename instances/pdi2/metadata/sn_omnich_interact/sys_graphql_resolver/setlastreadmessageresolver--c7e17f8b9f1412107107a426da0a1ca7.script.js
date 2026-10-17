(function process(/*ResolverEnvironment*/ env) {

    // implement data resolver here
    var interactionId = env.getArguments().interactionId;
    var userId = env.getArguments().userId;

    return new sn_omnich_interact.ConversationGraphQLUtil().setLastReadMessage(interactionId, userId);
})(env);
