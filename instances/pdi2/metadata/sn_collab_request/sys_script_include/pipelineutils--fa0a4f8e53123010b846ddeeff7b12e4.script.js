var PipelineUtils = Class.create();

PipelineUtils.prototype = {
	initialize: function() {},

    getPipelineInstanceIdByType: function(current) {
		var pipelineEnvironmentGR = new GlideRecord(CollabTaskConstants.tables.PIPELINE_ENVIRONMENT);
		var hasOriginatingInstanceIDInEnvironment = pipelineEnvironmentGR.get(current.originating_environment);
		
		if (!hasOriginatingInstanceIDInEnvironment) return;

		return pipelineEnvironmentGR.getValue('instance_id');
	}
};
