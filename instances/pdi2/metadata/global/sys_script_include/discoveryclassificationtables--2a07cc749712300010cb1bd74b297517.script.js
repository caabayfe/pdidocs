var DiscoveryClassificationTables = Class.create();
DiscoveryClassificationTables.prototype = {
	process: function() {
		var table = '' + current.getTableName();
		var javaList = this.getList(table);
		var result = [];
		
		for (var i = 0; i < javaList.size(); i++) 
			result.push('' + javaList.get(i));
		
		return result;
	},
	
	getList: function(table) {
		var dbom = GlideDBObjectManager.get();
		var javaList = dbom.getTableExtensions('cmdb_ci'); 
		
		if (table == 'discovery_classy_proc' || table == 'discovery_classy_appl')
			javaList = dbom.getAllExtensions('cmdb_ci_appl');
		else if (table == 'discovery_classy_windows') {
			javaList = dbom.getAllExtensions('cmdb_ci_win_server');
			javaList.add("cmdb_ci_computer");
			javaList.add("cmdb_ci_hyper_v_server");
			javaList.add("cmdb_ci_win_cluster");
			javaList.add("cmdb_ci_pc_hardware"); // A table defined in the Extended CMDB			
		} else if (table == 'discovery_classy_unix') {
			javaList = dbom.getAllExtensions('cmdb_ci_hardware');
		} else if (table == 'discovery_classy_snmp') {
			javaList = dbom.getAllExtensions('cmdb_ci_hardware');
		} else if (table == 'discovery_snmp_oid') {
			javaList = dbom.getAllExtensions('cmdb_ci_hardware');
		}		

		return javaList;
			
	},

    type: 'DiscoveryClassificationTables'
}
