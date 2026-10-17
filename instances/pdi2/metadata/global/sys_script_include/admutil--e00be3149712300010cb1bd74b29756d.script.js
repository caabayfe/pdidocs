// Discovery

var ADMUtil = Class.create();

/**
 * Returns true if current is a process classifier that has application instances associated with it.
 */
ADMUtil.hasApplicationInstances = function() {
	if ((current == null) || (current.getTableName() != 'discovery_classy_proc'))
		return false;
	
	var gr = new GlideRecord('cmdb_ci_appl');
	gr.addQuery('classifier', '' + current.sys_id);
	gr.query();
	return gr.next();
};
	
/**
 * Returns true if current is a process classifier that has a matching "Do not classify" process handler.
 */
ADMUtil.hasDoNotClassifyProcessHandler = function() {
	if ((current == null) || (current.getTableName() != 'discovery_classy_proc'))
		return false;
	
	var gr = new GlideRecord('discovery_proc_handler');
	gr.addQuery('condition', '' + current.condition);
	gr.addQuery('classify', false);
	gr.query();
	return gr.next();
};

ADMUtil.prototype = {
	initialize: function() {
		// the fields to ignore when copying over data from recently discovered (duplicate)
		// clustered application to its existing gliderecord
		this.ignoreFields = {
			'sys_id'           : true,
			'sys_created_by'   : true,
			'sys_created_on'   : true,
			'first_discovered' : true
		};

		// supported clustered apps and the fields used to match
		this.clusteredApps = {
			'cmdb_ci_db_mssql_instance': {
				matchFields: [ 'instance_name', 'name' ]
			}
		};

		this.GlideRecordUtil = new GlideRecordUtil();
	},

	reconcileExistingClusteredApp: function(clusterGr, appSysId, relTypeSysId, hostSysId) {
		var existingAppSysId = null;
		var appGr = this.GlideRecordUtil.getCIGR(appSysId);
		if (!appGr)
			return null;

		var appTable = appGr.getRecordClassName()+'';

		if (!this.clusteredApps[appTable])
			return null;

		var hostGr = this.GlideRecordUtil.getCIGR(hostSysId);
		if (!hostGr)
			return null;

		var hostTable = hostGr.getRecordClassName()+'';

		// find the other applications running on this cluster with the same class
		var existingRelGr = new GlideRecord('cmdb_rel_ci');
		existingRelGr.addQuery('child', clusterGr.sys_id+'');
		existingRelGr.addQuery('parent.sys_class_name', appTable);
		existingRelGr.addQuery('type', relTypeSysId);
		existingRelGr.addQuery('parent', '!=', appGr.sys_id+'');
		existingRelGr.query();

		while (existingRelGr.next()) {
			var existingClusteredAppGr = new GlideRecord(appTable);
			if (!existingClusteredAppGr.get(existingRelGr.parent+''))
				continue;

			// make sure all fields match for specified clustered app
			var matchFields = this.clusteredApps[appTable].matchFields;
			var allFieldsMatch = matchFields.every(function(field) {
				return appGr[field] + '' === existingClusteredAppGr[field] + '';
			});
			if (!allFieldsMatch)
				continue;

			// we have a match, find the existing rel between existing app and the host it used to run on
			var existingAppHostRelGr = new GlideRecord('cmdb_rel_ci');
			existingAppHostRelGr.addQuery('parent', existingClusteredAppGr.sys_id+'');
			existingAppHostRelGr.addQuery('type', relTypeSysId);
			existingAppHostRelGr.addQuery('child.sys_class_name', hostTable);
			existingAppHostRelGr.query();

			// apps should only be hosted on one instance of a particular class so if we
			// failed to find the existing app to host rel to update, abort
			if (existingAppHostRelGr.getRowCount() !== 1)
				break;

			existingAppHostRelGr.next();
			// update the child ref to the new host
			existingAppHostRelGr.child = hostSysId;
			existingAppHostRelGr.update();
			// copy the data from recently discovered app to the existing match
			var dataToCopy = {};
			this.GlideRecordUtil.populateFromGR(dataToCopy, appGr, this.ignoreFields);
			this.GlideRecordUtil.mergeToGR(dataToCopy, existingClusteredAppGr);
			existingClusteredAppGr.update();
			// now we can delete the recently discovered duplicate app
			appGr.deleteRecord();
			// return the existing app sys_id back to ADM so process classification can continue with
			// the correct clustered application record
			existingAppSysId = existingClusteredAppGr.sys_id+'';
			break;
		}

		return existingAppSysId;
	},

    type: 'ADMUtil'
};
