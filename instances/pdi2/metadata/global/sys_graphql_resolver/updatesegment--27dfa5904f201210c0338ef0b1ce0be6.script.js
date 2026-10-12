(function process( /*ResolverEnvironment*/ env) {

  var segmentSysId = env.getArguments()['segment_sys_id'] ? env.getArguments()['segment_sys_id'] : "";
  var agentSysId = env.getArguments()['agent_sys_id'] ? env.getArguments()['agent_sys_id'] : "";
  var interactionSysId = env.getArguments()['interaction_sys_id'] ? env.getArguments()['interaction_sys_id'] : "";
  var externalSegmentId = env.getArguments()['external_segment_id'] ? env.getArguments()['external_segment_id'] : "";

  var wrapUpCode = env.getArguments()['wrap_up_code'] ? env.getArguments()['wrap_up_code'] : "";
  var notes = env.getArguments()['notes'] ? env.getArguments()['notes'] : "";
  var confirmedOn = env.getArguments()['confirmed_on'] ? env.getArguments()['confirmed_on'] : "";
  var includeSessionMessagesOnSuccess = env.getArguments()['include_session_messages_on_success'] ? env.getArguments()['include_session_messages_on_success'] : false;
  var configuration = env.getArguments()['configuration'] ? env.getArguments()['configuration'] : null;

  var result = sn_interaction.WrapUpSegment.updateSegment(
        segmentSysId,
        agentSysId,
        interactionSysId,
        externalSegmentId,
        wrapUpCode,
        notes,
	confirmedOn,
	includeSessionMessagesOnSuccess,
	configuration
    );
    return JSON.parse(result);


})(env);
