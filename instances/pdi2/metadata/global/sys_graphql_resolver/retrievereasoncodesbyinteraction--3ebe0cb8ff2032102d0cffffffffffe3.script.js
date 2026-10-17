(function process( /*ResolverEnvironment*/ env) {
    var reasonCodes = [];
    var interactionId = env.getArguments()['interaction_id'] ? env.getArguments()['interaction_id'] : "";
    if (interactionId)
        reasonCodes = sn_interaction.HelpRequestReason.getReasonCodesForInteraction(interactionId);
    return reasonCodes;
})(env);
