var TodoNonTaskTablesDefault = Class.create();
	TodoNonTaskTablesDefault.prototype = {

		getTodoTables: function() {
			var extensions = new GlideTableHierarchy("task").getAllExtensions();
			extensions.push("sysapproval_approver");
			extensions.push("sn_hr_integrations_todo_inbound");
			if (new GlidePluginManager().isActive("com.sn_jny"))
				extensions.push("sn_jny_journey");
			if (new GlidePluginManager().isActive("sn_dlir"))
				extensions.push("sn_dlir_incident");
			return extensions;
		},

		type: 'TodoNonTaskTablesDefault'
	};
