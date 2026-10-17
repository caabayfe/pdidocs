var ProminSimpleList = Class.create();
ProminSimpleList.prototype = {
	initialize: function() {},

	canLaunchProcessMining: function (table) {
		var allowedTables = new global.ProminAllowedTableList().getAllowedTableList([table]);
		return gs.hasRole("sn_process_mining_analyst") && allowedTables.length > 0;
	},

    type: 'ProminSimpleList'
};
