(function executeRule(current, previous /*null when async*/ ) {

	try {
		var pipelineEnvironmentGR = new GlideRecord(CollabTaskConstants.tables.PIPELINE_ENVIRONMENT);
		var hasOriginatingInstanceIDInEnvironment = pipelineEnvironmentGR.get('instance_id', current.originating_instance_id);

		if (!hasOriginatingInstanceIDInEnvironment) return;

		current.setValue('originating_environment', pipelineEnvironmentGR.getUniqueValue());
		current.update();
	} catch(e) {
		gs.addErrorMessage(gs.getMessage('Unable to update originating environment'));
	}

})(current, previous);
