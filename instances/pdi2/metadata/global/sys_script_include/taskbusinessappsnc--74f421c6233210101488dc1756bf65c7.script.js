var TaskBusinessAppSNC = Class.create();
	TaskBusinessAppSNC.prototype = {
		initialize: function() {
		},
	
		canPopulateBusinessApplications: function(table) {
			if (!table)
				return false;

			return (gs.getProperty("com.snc." + table + ".populate_business_application", "false") + "" === "true");
		},

		removeBusinessApplications: function(taskSysId) {
			if (!taskSysId)
				return;
	
			var m2m = new GlideRecord('task_cmdb_ci_business_app');
			m2m.addQuery('task', taskSysId);
			m2m.addQuery('manually_added', false);
			m2m.query();
			m2m.deleteMultiple();
		},
	
		addBusinessApplications: function(taskSysId, services) {
			if (!taskSysId)
				return;

			var manualAddedBusApps = new TaskUtils().getManuallyAddedRecords(taskSysId, 'task_cmdb_ci_business_app', 'business_application');
			var businessApps = this.getBusinessAppsImpactedByServices(services);

			if (manualAddedBusApps.length > 0) {
				businessApps = businessApps.filter( function( el ) {
					return manualAddedBusApps.indexOf( el ) === -1;
				});
			}

			var m2m = new GlideRecord('task_cmdb_ci_business_app');
			for (var i = 0; i < businessApps.length; i++) {
				m2m.initialize();
				m2m.setValue('task', taskSysId);
				m2m.setValue('business_application', businessApps[i]);
				m2m.setValue('manually_added', false);
				m2m.insert();
			}
		},
	
		getBusinessAppsImpactedByServices: function(services) {
			var businessApplications = [];
	
			if (services) {
				var relGR = new GlideRecord('cmdb_rel_ci');
				relGR.addQuery('parent.sys_class_name', 'cmdb_ci_business_app');
				relGR.addQuery('type', '41008aa6ef32010098d5925495c0fb94'); // Consumes::Consumed by
				relGR.addQuery('child.sys_id', 'IN', services);
				relGR.query();
	
				while (relGR.next()) {
					var parent = relGR.parent.sys_id.toString();
					if (businessApplications.indexOf(parent) == -1)
						businessApplications.push(parent);
				}
			}
			return businessApplications;
		},
	
		type: 'TaskBusinessAppSNC'
	};
