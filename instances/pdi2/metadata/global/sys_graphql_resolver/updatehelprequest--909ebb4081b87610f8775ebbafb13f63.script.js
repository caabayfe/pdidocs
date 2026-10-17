(function process( /*ResolverEnvironment*/ env) {

    var interactionHelpRequestId = env.getArguments()['help_request_id'] ? env.getArguments()['help_request_id'] : "";
    var interaction = env.getArguments()['interaction'] ? env.getArguments()['interaction'] : "";
    var state = env.getArguments()['state'] ? env.getArguments()['state'] : "";
    var additionalMetadata = env.getArguments()['additional_metadata'] ? env.getArguments()['additional_metadata'] : "";

    var params = {
        interaction: interaction
    };

    if (state)
        params.state = state;

    if (additionalMetadata) {
        additionalMetadata = JSON.parse(additionalMetadata);
        if (Object.keys(additionalMetadata).length > 0)
            params.additionalMetadata = additionalMetadata;
    }

    var result = sn_interaction.HelpRequest.createOrUpdateHelpRequest(interactionHelpRequestId, params);
    return JSON.parse(result); 

})(env);
