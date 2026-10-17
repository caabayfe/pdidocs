(function process( /*ResolverEnvironment*/ env) {

    var interaction = env.getArguments()['interaction'] ? env.getArguments()['interaction'] : "";
    var reasonCode = env.getArguments()['reason_code'] ? env.getArguments()['reason_code'] : "";
    var description = env.getArguments()['description'] ? env.getArguments()['description'] : "";
    var additionalMetadata = env.getArguments()['additional_metadata'] ? env.getArguments()['additional_metadata'] : "";

    var params = {
        interaction: interaction,
		reason_code: reasonCode
    };

    if (description)
        params.description = description;

    if (additionalMetadata) {
        additionalMetadata = JSON.parse(additionalMetadata);
        if (Object.keys(additionalMetadata).length > 0)
            params.additionalMetadata = additionalMetadata;
    }

    var result = sn_interaction.HelpRequest.createOrUpdateHelpRequest("", params);
    return JSON.parse(result);

})(env);
