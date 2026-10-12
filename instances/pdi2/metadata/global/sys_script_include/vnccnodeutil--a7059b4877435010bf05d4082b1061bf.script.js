var VNCCNodeUtil = Class.create();
VNCCNodeUtil.prototype = {
    initialize: function() {
    },
	
	getDefaultNodeTypes : function() {
		return ["Generic.Primary", "Generic.Standby", "UI.Default", "Worker.Default", "Developer.Primary", "Developer.Standby", "UI.Primary", "Worker.Primary"];
	},
	
	getInUseNodeTypes : function() {
		var inUseNodeTypes = [];
		var ga = new GlideAggregate("sys_cluster_state");
		ga.groupBy("node_type");
		ga.query();
		while (ga.next()) {
			inUseNodeTypes.push(ga.getValue("node_type"));
		}
		return inUseNodeTypes;
	},

    type: 'VNCCNodeUtil'
};
