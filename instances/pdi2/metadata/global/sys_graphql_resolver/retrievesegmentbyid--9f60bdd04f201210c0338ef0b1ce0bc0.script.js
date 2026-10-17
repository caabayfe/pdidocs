(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here.
      var id = env.getArguments()['segment_id'] ? env.getArguments()['segment_id'] :
        env.getArguments()['external_segment_id'] ? env.getArguments()['external_segment_id'] :
        "";
    
	var result = sn_interaction.WrapUpSegment.getSegment(id);
    return JSON.parse(result);

})(env);
