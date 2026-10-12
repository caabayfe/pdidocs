(function process( /*ResolverEnvironment*/ env) {
    
var agentId = env.getArguments()['agent_id'] ? env.getArguments()['agent_id'] : "";
var interactionId = env.getArguments()['interaction_id'] ? env.getArguments()['interaction_id'] : "";
    
	var result = sn_interaction.WrapUpSegment.getSegmentByAgentAndInteraction(agentId, interactionId);
    return JSON.parse(result);

})(env);
