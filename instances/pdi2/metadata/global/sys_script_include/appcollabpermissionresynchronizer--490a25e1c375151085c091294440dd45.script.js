var AppCollabPermissionResynchronizer = Class.create();
AppCollabPermissionResynchronizer.prototype = {
    initialize: function() {
		this.constants = {
			users: {
				tableName: "sys_appcollab_user",
				columnName: "user",
				syncMethod: "syncUserPermissions"
			},
			groups: {
				tableName: "sys_appcollab_group",
				columnName: "group",
				syncMethod: "syncGroupPermissions"
			}
		};

		this.appCollabRecords = {
			users: {
				valid: [],
				invalid: [],
			},
			groups:  {
				valid: [],
				invalid: [],
			},
		};
		
		this.logs = {
			success: [],
			error: []
		};
	},
	
	/**
	* Returns an object that can be used to display information for
	* app collaborator records that are valid and invalid (i.e. contain empty record fields)
	* If first param (execute) is true, permissions are synced and logs added
	* @param {Boolean} execute, optional param to determine whether to sync permissions
	* @param {String} sys_id of the app, optional table query filter
	* @return {Object} appCollabRecords: {users: {}, groups: {} }
	*/
	syncCollaborators: function(execute, appSysId) {
		this._syncCollaboratorByType("users", execute, appSysId);
		this._syncCollaboratorByType("groups", execute, appSysId);
		
		if (execute) {
			var logPrefix = "AppCollabPermissionResynchronizer syncCollaborators: \n\n";
			var successMessages = "Success: " + JSON.stringify(this.logs.success, null , "\t");
			var errorMessages = "Failed: " + JSON.stringify(this.logs.error, null , "\t");
			gs.log(logPrefix + successMessages + "\n\n" + errorMessages);
		}
		
		return this.appCollabRecords;
	},
	
	/**
	* Sets app collaborator user records that are valid and invalid (i.e. contain empty record fields)
	* in appCollabRecords class variable
	* @param {String} type of collaborator - "users" or "groups"
	* @param {Boolean} execute, optional param to determine whether to sync permissions
	* @param {String} sys_id of the app, optional table query filter
	*/
	_syncCollaboratorByType: function(type, execute, appSysId) {
		var typeConstants = this.constants[type];
		
		if (!typeConstants) {
			return;
		}

		var glideRecord = new GlideRecordSecure(typeConstants.tableName);
		if (appSysId) { glideRecord.addQuery('application', appSysId); }
		glideRecord.query();
		
		while(glideRecord.next()) {
			var collabTypeRefRecord = glideRecord.getElement(typeConstants.columnName).getRefRecord();
			var descriptorRefRecord = glideRecord.getElement("descriptor").getRefRecord();
			var appRefRecord = glideRecord.getElement("application").getRefRecord();
			
			var link = '<a target="_blank" href="' + glideRecord.getLink() + '">' + glideRecord.getClassDisplayValue() + '</a>';

			if( collabTypeRefRecord.isValidRecord() && descriptorRefRecord.isValidRecord() && appRefRecord.isValidRecord() ) {
				this.appCollabRecords[type].valid.push(glideRecord.getElement("sys_id"));

				if (execute) {
					try {
						var synchronizer = new sn_appcollab.CollabPermissionSynchronizer(descriptorRefRecord.getValue("sys_id"));
						synchronizer[typeConstants.syncMethod](collabTypeRefRecord.getValue("sys_id"), appRefRecord.getValue("sys_id"));
						
						this.logs.success.push({
							message: gs.getMessage("Synced permissions for {0} with {1} descriptor for {2} application.", [collabTypeRefRecord.getDisplayValue(), descriptorRefRecord.getDisplayValue(), appRefRecord.getDisplayValue()]),
							link: link,
						});
					
					} catch(error) {
						this.logs.error.push({
							message: gs.getMessage("Error syncing permissions for {0} with {1} descriptor for {2} application.", [collabTypeRefRecord.getDisplayValue(), descriptorRefRecord.getDisplayValue(), appRefRecord.getDisplayValue()]),
							link: link,
							details: error
						});
					}
				}
			} else {
				this.appCollabRecords[type].invalid.push(glideRecord.getElement("sys_id"));
				this.logs.error.push({
					message: gs.getMessage("Unable to sync permissions due to missing references."),
					link: link,
					details: {
						sysId: glideRecord.getUniqueValue(),
						table: glideRecord.getTableName(),
						isValidUserOrGroup: collabTypeRefRecord.isValidRecord(),
						isValidApp: appRefRecord.isValidRecord(),
						isValidDescriptor: descriptorRefRecord.isValidRecord(),
					}
				});
			}
		}
	},

    type: 'AppCollabPermissionResynchronizer'
};
