var FlowOpsViewAccessChecker = Class.create();
FlowOpsViewAccessChecker.prototype = {
    initialize: function() {
    },

	canRead: function(contentGr) {
		var flowContext;
		var flow;
		var canReadContext;
		var canReadFlow;
		if (!gs.nil(contentGr.context)) {
			flowContext = new GlideRecord('sys_flow_context');
			if (flowContext.get('sys_id', contentGr.context)){
				canReadContext = flowContext.canRead();
			}
			if(!canReadContext)
				return false;

			flow = new GlideRecord('sys_hub_flow');
			if(flow.get('sys_id', contentGr.context.flow)) {
				canReadFlow = flow.canRead();
			}
			else {
				flow = new GlideRecord('sys_hub_action_type_definition');
				if (flow.get('sys_id', contentGr.context.flow))
					canReadFlow = flow.canRead();
			}
		}
		return canReadContext && canReadFlow;
	},
	
    type: 'FlowOpsViewAccessChecker'
};
