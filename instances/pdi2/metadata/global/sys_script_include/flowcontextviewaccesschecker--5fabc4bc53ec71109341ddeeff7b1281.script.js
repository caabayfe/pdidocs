var FlowContextViewAccessChecker = Class.create();
FlowContextViewAccessChecker.prototype = {
    initialize: function() {
    },

	canRead: function(contextGr) {
		var canRead = (new FlowDesignerContentFiltering()).canRead(contextGr);
		if(!canRead) {
		  return canRead;
		}
		var requireFlowAccess = gs.getProperty('com.snc.process_flow.reporting.require_flow_access', 'true');
		if (requireFlowAccess == 'true' && !gs.nil(contextGr.flow)) {
			var flow;
			var canReadFlow = true;
			flow = new GlideRecord('sys_hub_flow');
			if (flow.get('sys_id', contextGr.flow)) {
				canReadFlow = flow.canRead();
			}
			else {
				flow = new GlideRecord('sys_hub_action_type_definition');
				if(flow.get('sys_id', contextGr.flow))
					canReadFlow = flow.canRead();
			}
			canRead = canReadFlow;
		}
		return canRead;
	},

    type: 'FlowContextViewAccessChecker'
};
