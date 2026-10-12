var PipelineEnvironmentOrderUtils = Class.create();
PipelineEnvironmentOrderUtils.prototype = {
    initialize: function() {},

    getPipelineEnvironmentOrderList: function(pipelineSysId) {
        var pipelineUtils = new PipelineUtils();
        var pipelineEnvironmentOrderFields = PipelineConstants.columns.PIPELINE_ENVIRONMENT_ORDER_COLUMNS;
        var environmentFields = PipelineConstants.columns.ENVIRONMENT_COLUMNS;

        var output = [];

        var gr = new GlideRecord(PipelineConstants.table.PIPELINE_ENVIRONMENT_ORDER_TABLE);

        gr.addQuery('pipeline', pipelineSysId);
        gr.orderBy('order');

        gr.query();

        while (gr.next()) {
            var environment = pipelineUtils.getObjectFromGlideRecord(gr.environment.getRefRecord(), environmentFields);
            var pipelineEnvironmentOrder = pipelineUtils.getObjectFromGlideRecord(gr, pipelineEnvironmentOrderFields);

            pipelineEnvironmentOrder.environment = environment;

            output.push(pipelineEnvironmentOrder);
        }

        return output;
    },

    type: 'PipelineEnvironmentOrderUtils'
};
