var ClusterStateRoleList = Class.create();
ClusterStateRoleList.prototype = {
    initialize: function() {
    },
	
	process: function() {	
		var choiceList = new GlideChoiceList();

		var ga = new GlideAggregate("sys_node_type");
		ga.groupBy("role");
		ga.query();		
		while(ga.next()) {
			var role = ga.getValue("role");
			choiceList.add(new GlideChoice(role, role));
		}
		
		return choiceList;
		
	},

    type: 'ClusterStateRoleList'
};
