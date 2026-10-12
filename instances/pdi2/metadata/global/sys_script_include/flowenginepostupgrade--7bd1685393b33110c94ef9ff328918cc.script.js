    var FlowEnginePostUpgrade = Class.create();

  FlowEnginePostUpgrade.prototype = {
	process: function() {
		if (this.isUpgradeFinished()) {
			if (GlideTableDescriptor.fieldExists('sys_flow_context','engine_major_version')) {
				gs.log('Fix Script to update Major Engine Version: Upgrade is finished, Changing the engine major version to 2.');
				this.activateEngineV2();
				this.deleteScheduler('Set_engine_major_version_to_2');
			} else {
				gs.log('FlowEnginePostUpgrade: Upgrade is finished, but sys_flow_context.engine_major_version does not exist');
			}
        }
	},

	isUpgradeFinished: function() {
		try {
			return !SNC.UpgradeAPI.isUpgradeInProgress();
		} catch (ex) {
			gs.log('Fix Script FlowEnginePostUpgrade: Failed. Exception thrown while checking isUpgradeInProgress(): ' + ex);
			return false;
		}
	},

	activateEngineV2: function() {
		var propName = 'com.glide.hub.flow_engine.engine_major_version';
		var propGr = new GlideRecord('sys_properties');
		var propertyExists = propGr.get('name', propName);
		if (propertyExists) {
			// update
			gs.log('Property: ' + propName + ' exists, updating major engine version to 2.');
			propGr.setValue('value', 2);
			propGr.setWorkflow(true);
			propGr.update();
		} else {
			// create
			gs.log('Property: ' + propName + ' does not exists, creating property with major engine version to 2.');
			var gr = new GlideRecord('sys_properties');
			gr.initialize();
			gr.setValue('name', propName);
			gr.setValue('value', 2);
			gr.setValue('type', 'integer');
			gr.setValue('description', 'Determines which version of the flow designer execution engine is used');
			gr.setValue('ignore_cache', 'true');
			gr.setValue('read_roles', 'admin,maint');
			gr.setValue('write_roles', 'maint');
			gr.setWorkflow(true);
			gr.insert();
		}
	},

	deleteScheduler: function(schedulerName) {
		var gr = new GlideRecord('sys_trigger');
		gr.addQuery('name', schedulerName);
		gr.addQuery('trigger_type', '1');
		gr.query();
		if (gr.next()) {
			gr.deleteRecord();
			gs.log("Fix Script FlowEnginePostUpgrade to Delete Scheduler: " + schedulerName + " Sys Trigger record got deleted.");
		}
	},

	activateSeparateReportingValues: function() {
		if (this.isUpgradeFinished()) {
			if (GlideTableDescriptor.fieldExists('sys_flow_context','separate_reporting_values')
			&& GlideTableDescriptor.isValid('sys_flow_report_value')
			&& GlideTableDescriptor.isValid('sys_flow_report_value_chunk')) {
				gs.log('Fix Script to update separate_reporting_values: Upgrade is finished, Changing the com.glide.hub.flow_engine.separate_reporting_values to true.');
				this.updateSeparateReportingValuesProperty();
				this.activateTableCleaner("98db7ffd4f0032107aa927bc32ce0b93");
				this.deleteScheduler('Activate Separate Reporting Values');
			} else {
				gs.log('FlowEnginePostUpgrade: Upgrade is finished, but sys_flow_context.separate_reporting_values or sys_flow_report_value does not exist');
			}
        }
	},

	activateTableCleaner: function(sysId) {
		var tableCleanerGr = new GlideRecord('sys_auto_flush');
		if (tableCleanerGr.get(sysId)) {
			tableCleanerGr.setValue('active', true);
			tableCleanerGr.update();
		} else {
			gs.error("Flow-Engine: Upgrade finished, table cleaner with sys_id:" + sysId + " is not activated.");
		}
	},

	updateSeparateReportingValuesProperty: function() {
		var propName = 'com.glide.hub.flow_engine.separate_reporting_values';
		var propGr = new GlideRecord('sys_properties');
		var propertyExists = propGr.get('name', propName);
		if (propertyExists) {
			// update
			gs.log('Property: ' + propName + ' exists, updating com.glide.hub.flow_engine.separate_reporting_values to true.');
			propGr.setValue('value', true);
			propGr.setWorkflow(true);
			propGr.update();
		} else {
			// create
			gs.log('Property: ' + propName + ' does not exists, creating property with com.glide.hub.flow_engine.separate_reporting_values to true.');
			var gr = new GlideRecord('sys_properties');
			gr.initialize();
			gr.setValue('name', propName);
			gr.setValue('value', true);
			gr.setValue('type', 'boolean');
			gr.setValue('description', 'Determines if reporting values have to be separated from sys_flow_value to sys_flow_reporting_value');
			gr.setValue('ignore_cache', 'true');
			gr.setValue('read_roles', 'admin,maint');
			gr.setValue('write_roles', 'maint');
			gr.setWorkflow(true);
			gr.insert();
		}
	},


	type: 'FlowEnginePostUpgrade'
};
