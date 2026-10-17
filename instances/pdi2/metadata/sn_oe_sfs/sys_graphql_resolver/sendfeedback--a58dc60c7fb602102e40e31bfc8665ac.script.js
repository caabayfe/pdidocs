(function process( /*ResolverEnvironment*/ env) {
    let input = env.getArguments();
    let {
        feedback: {
            messageId,
            value,
            additionalData
        },
        genAILogId
    } = input;
    var util = new CollabChatUtils();
    return util.sendFeedback(messageId, genAILogId, value, additionalData);
})(env);
