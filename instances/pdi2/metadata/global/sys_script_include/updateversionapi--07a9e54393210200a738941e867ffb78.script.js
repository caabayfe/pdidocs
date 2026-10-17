var UpdateVersionAPI = Class.create();
UpdateVersionAPI.prototype = {
	initialize: function() {
	},
	
	/* Retruns an array of customer file IDs from the provided queried sys_metadata GlideRecord */
	/* Array */ getCustomerFileIds: function(/* sys_metadata */ files) {
		var ids = [];
		while(files.next()) {
			if(files.sys_update_name.nil())
				continue;
			
			var versions = new GlideRecord('sys_update_version');
			versions.addQuery('name', files.sys_update_name.toString());
			versions.query();
			
			// if a file has 0 versions, then not a customer file
			if(versions.getRowCount() === 0)
				continue;
			
			// if there exists a named version of source sys_upgrade_history or sys_store_app, then not a customer file
			var isCustomerFile = true;
			while(versions.next()) {
				var source = versions.source_table.toString();
				if(source === 'sys_upgrade_history' || source === 'sys_store_app') {
					isCustomerFile = false;
					break;
				}
			}
			if(isCustomerFile)
				ids.push(files.getUniqueValue());
		}
		return ids;
	},

	/**
	* @param {Array<string>} applicationIds - Array of sys_scope sys_ids
	* @returns Array of strings - Array of file names that are from app/upgrade source
	* @description - identify sys_metadata files that are not from app/upgrade source
	*/
	getCustomerFileNames: function(applicationIds) {
		if (!applicationIds || applicationIds.length === 0) {
			return [];
		}

		var uniqueFileNames = [];
		var gaUpdateVersion = new GlideAggregate('sys_update_version');
		gaUpdateVersion.addQuery('application', 'IN', applicationIds);
		gaUpdateVersion.groupBy('name');
		gaUpdateVersion.query();
		
		while (gaUpdateVersion.next()) {
			uniqueFileNames.push(gaUpdateVersion.getValue('name'));
		}

		var customerFilesList = [];		
		if (uniqueFileNames.length > 0) {
			var nonCustomerFiles = {};
			var grUpdateVersion = new GlideRecord('sys_update_version');
			grUpdateVersion.addQuery('application', 'IN', applicationIds);
			grUpdateVersion.addQuery('name', 'IN', uniqueFileNames);
			grUpdateVersion.addQuery('source_table', 'IN', 'sys_upgrade_history,sys_store_app');
			grUpdateVersion.query();
		
			while (grUpdateVersion.next()) {
				nonCustomerFiles[grUpdateVersion.getValue('name')] = true;
			}
		
			for (var i = 0; i < uniqueFileNames.length; i++) {
				var name = uniqueFileNames[i];
				if (!nonCustomerFiles[name]) {
					customerFilesList.push(name);
				}
			}
		}
		return customerFilesList;
	},
	
	type: 'UpdateVersionAPI'
};
