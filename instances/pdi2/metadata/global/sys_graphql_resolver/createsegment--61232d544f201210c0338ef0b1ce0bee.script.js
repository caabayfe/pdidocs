(function process( /*ResolverEnvironment*/ env) {
    var agentSysId = env.getArguments()['agent_sys_id'] ? env.getArguments()['agent_sys_id'] : "";
    var interactionSysId = env.getArguments()['interaction_sys_id'] ? env.getArguments()['interaction_sys_id'] : "";
    var openedOn = env.getArguments()['opened_on'] ? env.getArguments()['opened_on'] : "";
    var wrapUpConfigurationSysId = env.getArguments()['wrap_up_configuration_sys_id'] ? env.getArguments()['wrap_up_configuration_sys_id'] : "";

    var external = env.getArguments()['external'] ? env.getArguments()['external'] : false;
    var segmented = env.getArguments()['segmented'] ? env.getArguments()['segmented'] : false;
    var externalSegmentId = env.getArguments()['external_segment_id'] ? env.getArguments()['external_segment_id'] : "";
    var configuration = env.getArguments()['configuration'] ? env.getArguments()['configuration'] : null;
    var aiNotes = env.getArguments()['ai_notes'] ? env.getArguments()['ai_notes'] : "";
    var aiWrapUpCode = env.getArguments()['ai_wrap_up_code'] ? env.getArguments()['ai_wrap_up_code'] : null;

    var result = sn_interaction.WrapUpSegment.createSegment(
        agentSysId,
        interactionSysId,
        openedOn,
        wrapUpConfigurationSysId,
        external,
        segmented,
        externalSegmentId,
        configuration,
        aiWrapUpCode,
        aiNotes
    );

    return JSON.parse(result);



})(env);
