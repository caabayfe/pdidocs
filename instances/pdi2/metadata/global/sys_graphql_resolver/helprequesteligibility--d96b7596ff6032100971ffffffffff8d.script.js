(function process(env) {
		var interactionId = env.getArguments()['interaction_id'] || "";
		var result = sn_interaction.HelpRequestEligibility.helpRequestEligibility(interactionId);
		return result;
	})(env);
