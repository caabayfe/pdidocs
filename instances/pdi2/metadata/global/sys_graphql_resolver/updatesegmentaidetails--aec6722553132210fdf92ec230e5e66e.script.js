(function process( /*ResolverEnvironment*/ env) {

  var segmentSysId = env.getArguments()['segment_sys_id'] ? env.getArguments()['segment_sys_id'] : "";
  var agentSysId = env.getArguments()['agent_sys_id'] ? env.getArguments()['agent_sys_id'] : "";
  var interactionSysId = env.getArguments()['interaction_sys_id'] ? env.getArguments()['interaction_sys_id'] : "";
  var externalSegmentId = env.getArguments()['external_segment_id'] ? env.getArguments()['external_segment_id'] : "";
  
  var aiWrapUpCode = env.getArguments()['ai_wrap_up_code'] ? env.getArguments()['ai_wrap_up_code'] : "";
  var aiNotes = env.getArguments()['ai_notes'] ? env.getArguments()['ai_notes'] : "";
  var isExternalRequest = env.getArguments()['is_external_request'] ? env.getArguments()['is_external_request'] : false;

  var result = sn_interaction.WrapUpSegment.updateSegmentAiDetails(
        segmentSysId,
        agentSysId,
        interactionSysId,
        externalSegmentId,
        aiWrapUpCode,
        aiNotes,
        isExternalRequest
    );
    return JSON.parse(result);


})(env);
