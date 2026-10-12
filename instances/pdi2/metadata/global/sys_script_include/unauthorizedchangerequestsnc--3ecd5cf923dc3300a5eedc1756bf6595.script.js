var UnauthorizedChangeRequestSNC = Class.create();
UnauthorizedChangeRequestSNC.prototype = {
	DEFAULT_6HRS : '21600',
	PROP_UNAUTHORIZED_ENABLED: 'com.snc.change_request.enable_unauthorized',
	PLUGIN_SVC_MAPPING: "com.snc.service-mapping",
	PLUGIN_DISCOVERY: "com.snc.discovery.api",
	PROPERTY_TABLE: "unauth_chg_prop",
	PROPERTY_NOTIFICATION_TABLE: "unauth_chg_notifications",
	PROP_SYSID: "bdaaf92f231650101488dc1756bf6543",
	PROPERTY_TYPE_COMPATIBILITY: "com.snc.change_management.change_model.type_compatibility",
	MODEL_SYSID: "aedc6a625323101034d1ddeeff7b1296",

    initialize: function() {
		var prop = new GlideRecord(this.PROPERTY_TABLE);
		if (prop.get(this.PROP_SYSID)) {
			this.query = prop.getValue('query');
			this.included_class = prop.getValue('include_ci_class');
			this.notification_duration = prop.ignore_period.dateNumericValue();
			this.enabled = (prop.enable_event + "" === "true");
			this.useDomain = (prop.use_ci_domain + "" === "true");
			this.isDomainInstalled = GlidePluginManager.isActive("com.glide.domain");
		}
		this._timeWindow = this.DEFAULT_6HRS;
    },

	setWindowInSeconds: function(timeInSeconds) {
		this._timeWindow = timeInSeconds;
	},

	hasValidChange: function(ciSysId) {
		if (!ciSysId)
			return true;

		//Check firstly whether this is an inclusion CI Class 
		if (!this._isIncludedCIClass(ciSysId))
			return true;

		if (this._hasExistingNotification(ciSysId))
			return true;

		var gdt = new GlideDateTime();
		gdt.addSeconds(this._timeWindow * -1);

		//Check if Discovery is installed and any horizontal discovery jobs have been run in a set time window
		if (GlidePluginManager.isActive(this.PLUGIN_DISCOVERY)) {
			var taskCiGr1 = new GlideRecord('task_ci');
			taskCiGr1.addQuery('ci_item', ciSysId);
			taskCiGr1.addQuery('discovery_last_updated', '>=', gdt.getValue());
			taskCiGr1.addQuery('task.sys_class_name', 'change_request');
			taskCiGr1.query();

			if (taskCiGr1.hasNext())
				return true;
		}

		//Check if service mapping is installed and any top down discovery jobs have been run in a set time window
		if (GlidePluginManager.isActive(this.PLUGIN_SVC_MAPPING)) {
			var taskServiceGr = new GlideRecord('task_cmdb_ci_service');
			taskServiceGr.addQuery('cmdb_ci_service', ciSysId);
			taskServiceGr.addQuery('discovery_last_updated', '>=', gdt.getValue());
			taskServiceGr.addQuery('task.sys_class_name', 'change_request');
			taskServiceGr.query();

			if (taskServiceGr.hasNext())
				return true;
		}

		//Check if there are any active Change Requests for the configuration item 
		//with no recent Discovery jobs.
		if (!this.query)
			this.query = "active=true^EQ";

		var changeGr = new GlideRecord('change_request');
		changeGr.addEncodedQuery(this.query);
		changeGr.addQuery('JOINchange_request.sys_id=task_ci.task!ci_item=' + ciSysId);
		changeGr.query();

		return changeGr.hasNext();
	},

	createUnauthorizedChange: function(ciSysId, changedData) {
		if (!ciSysId)
			return;

		var chgGr;
		if (gs.getProperty(this.PROPERTY_TYPE_COMPATIBILITY, 'false') + "" === "true") {
			chgGr = ChangeRequest.newEmergency();
			chgGr.setValue('unauthorized', true);
			chgGr.setValue('short_description', gs.getMessage('An unauthorized change has been detected'));
		} else
			chgGr = ChangeRequest.newChange(this.MODEL_SYSID);

		chgGr.setValue('cmdb_ci', ciSysId);
		chgGr.setValue('description', this._formatChangedData(changedData));

		//Check if the domain should be set to the same as the CI
		if (this.isDomainInstalled && this.useDomain) {
			var ciGr = new GlideRecord('cmdb_ci');
			if (ciGr.get(ciSysId))
				chgGr.setValue('sys_domain', ciGr.getValue('sys_domain'));
		}
		chgGr.insert();

		this._updateNotificationTable(ciSysId);

		return chgGr.getGlideRecord();
	},

	isUnauthorizedEnabled: function() {
		if (gs.getProperty(this.PROP_UNAUTHORIZED_ENABLED))
			return gs.getProperty(this.PROP_UNAUTHORIZED_ENABLED, 'true') + "" === "true";
		else
			return this.enabled;
	},
	
	_formatChangedData: function(data) {
		var formattedData = '';
		if (!data)
			return formattedData;
		var jsonData = JSON.parse(data);

		for (var i = 0; i < jsonData.updatedFields.length; i++) {
			var updatedField = jsonData.updatedFields[i];
			var values = [];
			values.push(updatedField.fieldName);
			values.push(updatedField.oldValue ? updatedField.oldValue : '');
			values.push(updatedField.newValue);
			formattedData += gs.getMessage('Field: {0}  Old Value: {1}  New Value: {2}\n', values);
		}

		return formattedData;
	},

	_hasExistingNotification: function(ciSysId) {
		if (!ciSysId)
			return false;

		var notificationGr = new GlideRecord(this.PROPERTY_NOTIFICATION_TABLE);
		notificationGr.addQuery('cmdb_ci', ciSysId);
		notificationGr.query();

		if (notificationGr.next()) {
			var currentDiff = gs.dateDiff(notificationGr.getValue('last_event_sent'), new GlideDateTime());
			var diffDuration = new GlideDuration(currentDiff);
			return diffDuration.getNumericValue() < this.notification_duration;
		}
		return false;
	},

	_isIncludedCIClass: function(ciSysId) {
		if (!this.included_class)
			return false;

		var classArray = this.included_class.split(',');
		var arrUtil = new ArrayUtil();

		var ci = new GlideRecord('cmdb_ci');
		if (ci.get(ciSysId) && Array.isArray(classArray)) {
			return arrUtil.contains(classArray, ci.sys_class_name);
		}

		return false;
	},

	_updateNotificationTable: function(ciSysId) {
		var notificationGr = new GlideRecord(this.PROPERTY_NOTIFICATION_TABLE);
		notificationGr.addQuery('cmdb_ci', ciSysId);
		notificationGr.query();

		if (notificationGr.next()) {
			notificationGr.setDisplayValue('last_event_sent', gs.nowDateTime());
			notificationGr.update();
		} else {
			notificationGr = new GlideRecord(this.PROPERTY_NOTIFICATION_TABLE);
			notificationGr.setValue('cmdb_ci', ciSysId);
			notificationGr.setDisplayValue('last_event_sent', gs.nowDateTime());
			notificationGr.insert();
		}
	},

	getExtensions: function() {
		var ciTables = new TableUtils('cmdb_ci');
		return ciTables.getTableExtensions();
	},

	getSvcExcludedExtensions: function() {
		var ciTables = new TableUtils('cmdb_ci').getTableExtensions();
		var serviceTables = new TableUtils('cmdb_ci_service').getAllExtensions();
		for (var i=0; i < serviceTables.size(); i++)
			ciTables.remove(serviceTables.get(i));
		return ciTables;
	},

    type: 'UnauthorizedChangeRequestSNC'
};
