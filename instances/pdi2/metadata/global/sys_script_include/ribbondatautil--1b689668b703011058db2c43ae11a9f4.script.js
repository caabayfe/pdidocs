var RibbonDataUtil = Class.create();
RibbonDataUtil.prototype = {
    initialize: function() {
    },
	
	getCustomer360Data: function(table, sysId, primaryUser, primaryFields, secondaryUser, secondaryFields, tertiaryUser, tertiaryFields) {
		var results = [];
		var gr = new GlideRecord(table);
		gr.get(sysId);
		if (!gr.canRead()) return results;
		
		this._addUserFieldsDataToResults(results, primaryUser, gr, primaryFields);
		if (results.length == 0) this._addUserFieldsDataToResults(results, secondaryUser, gr, secondaryFields);
		if (results.length == 0) this._addUserFieldsDataToResults(results, tertiaryUser, gr, tertiaryFields);
        if (results.length == 0) this._addHeaderLabelToResults(results, primaryUser, gr);
		return results;
		
	},

    _addHeaderLabelToResults: function(results, user, gr) {
        var userTypeLabel = gs.getMessage('User');
        if (user) {
            userTypeLabel = gr.getElement(user).getLabel();
        }
        var item = {
            "userTypeLabel": userTypeLabel,
            "hasValue": false
        };
        results.push(item);
    },
	
	_constructFieldList: function(parentRecord, userRecord, userFields) {
		var fields = [];
		var userFieldsArray = userFields.split(",");
		if (userFieldsArray.indexOf("first_name") < 0)
			userFieldsArray.push("first_name");
		if (userFieldsArray.indexOf("last_name") < 0)
			userFieldsArray.push("last_name");
		if (userFieldsArray.indexOf("title") < 0)
			userFieldsArray.push("title");
		if (userRecord.getElement("vip") && userFieldsArray.indexOf("vip") < 0)
			userFieldsArray.push("vip");

		for (var i = 0; i < userFieldsArray.length; i++) {
			var field = userFieldsArray[i];
			var fieldDetails = {};
			if (!userRecord.getElement(field).canRead())
				continue;
			fieldDetails["value"] = userRecord.getElement(field).getValue();
			if (field == "time_zone" && !userRecord.getElement(field).getValue()) {
    			   fieldDetails["displayValue"] = GlideUser.getSysTimeZone();
			} else if (field == "country" && !userRecord.getElement(field).getValue()) {
    			   fieldDetails["displayValue"] = 'System (' + GlideLocale.get().getCurrent().getCountry() + ')';
			} else
    			   fieldDetails["displayValue"] = userRecord.getElement(field).getDisplayValue();
			fieldDetails["type"] = userRecord.getElement(field).getED().getInternalType();
			fieldDetails["label"] = userRecord.getElement(field).getED().getLabel();
			fieldDetails["name"] = field;
			fields.push(fieldDetails);
		}
		return fields;
	},
	
	_getAccountDetails: function(record, userType) {
		if (!this._shouldFetchAccountDetails(record, userType))
			return null;

		var accountInfo = {};
		if (!gs.nil(record.getValue('account'))) {
			var accountRecord = record.account.getRefRecord();
			if (!accountRecord.canRead()) return accountInfo;
			accountInfo.id = accountRecord.sys_id + '';
			accountInfo.name = accountRecord.name + '';
			if (accountRecord.active_escalation) {
				accountInfo.activeEscalation = {};
				var escalationRecord = accountRecord.active_escalation.getRefRecord();
				if (!escalationRecord.canRead() || gs.nil(escalationRecord)) return accountInfo;
				accountInfo.activeEscalation.id = escalationRecord.sys_id + '';
				accountInfo.activeEscalation.number = escalationRecord.number + '';
				accountInfo.activeEscalation.state = {};
				accountInfo.activeEscalation.state.value = escalationRecord.getValue('state');
				accountInfo.activeEscalation.state.displayValue = escalationRecord.getDisplayValue('state');
			}
		}
		return accountInfo;
	},
	
	_shouldFetchAccountDetails: function(record, userType) {
		if (record.getTableName() == "sn_customerservice_case" && (userType == 'contact' || userType == 'partner_contact'))
        return true;
		if (record.getTableName() == "customer_account" && userType == "primary_contact")
			return true;
		if (record.getTableName() == "customer_contact")
			return true;

		return false;
	},
	
	_addUserFieldsDataToResults: function(results, user, gr, relatedFields) {
		if (!gs.nil(user) && !gs.nil(gr.getElement(user))) {
			var fields = [];
			var userRecord = gr.getElement(user).getRefRecord();
			if (userRecord && userRecord.canRead()) {
				fields = this._constructFieldList(gr, userRecord, relatedFields);
				var item = {
					"userType": user,
					"userTypeLabel": gr.getElement(user).getLabel(),
					"avatar": GlideAvatarFinder.getAvatarPath(userRecord.sys_id + ''),
					"hasValue": !gs.nil(user),
					"fields": fields,
					"accountDetails": this._getAccountDetails(gr, user)
				};
				results.push(item);
			}
		}
	},
	
	getTimelineData: function(table, sysId) {
		var timelineEntries = [];
		var ngStream = new GlideNGStreamAPI().getFormStreamData(table, sysId, '');
		var entries = ngStream.entries();
		var usersActiveOnRecord = [];
		
		for (var i = 0; i < entries.size(); i++) {
			var timelineEntry = {};
			var entry = entries.get(i);
			timelineEntry.sysCreatedOn = entry.sys_created_on();
			timelineEntry.sysCreatedOnAdjusted = entry.sys_created_on_adjusted();
			timelineEntry.sysCreatedBy = entry.sys_created_by();
			timelineEntry.presenceUserId = entry.presence_user_id() + '';
			timelineEntry.type = entry.type();
			timelineEntry.initials = entry.initials();

			if (usersActiveOnRecord.indexOf(timelineEntry.presenceUserId) < 0)
				usersActiveOnRecord.push(timelineEntry.presenceUserId);

			if (entry.type() == "JOURNAL") {
				var journal = entry.journal();
				var journalEntry = {};
				if (journal.field_name() != "comments")
					continue;
				journalEntry.fieldName = journal.field_name();
				journalEntry.fieldLabel = journal.field_label();
				journalEntry.newValue = journal.new_value();
				journalEntry.sysId = journal.sys_id();
				timelineEntry.journalEntry = journalEntry;
			} else if (entry.type() == "AUDIT") {
				var auditValues = entry.audit();
				var auditEntries = [];
				for (var j = 0; j < auditValues.size(); j++) {
					var auditValue = auditValues.get(j);
					var auditEntry = {};
					auditEntry.fieldName = auditValue.field_name();
					auditEntry.fieldLabel = auditValue.field_label();
					auditEntry.newValue = auditValue.new_value();
					auditEntry.oldValue = auditValue.old_value();
					auditEntries.push(auditEntry);
				}
				timelineEntry.auditEntries = auditEntries;
			}
			timelineEntries.push(timelineEntry);
		}
		return {timelineEntries: timelineEntries, usersActiveOnRecord: usersActiveOnRecord};
	},
	
	getRSConfig: function (table) {
		var rsConfig = null;
		var tableHierarchy = GlideDBObjectManager.getTables(table).toArray().concat();
		var rsConfigRecord = new GlideRecord("sys_resolutionshaper_config");
		if (!rsConfigRecord.canRead()) return null;
		rsConfigRecord.addQuery("table", "IN", tableHierarchy);
		rsConfigRecord.query();
		while (rsConfigRecord.next()) {
			if (rsConfig == null || tableHierarchy.indexOf(rsConfigRecord.table + '') < tableHierarchy.indexOf(rsConfig.table)) {
				rsConfig = {};
				rsConfig.table = rsConfigRecord.table + '';
				rsConfig.requestorStates = rsConfigRecord.requestor_states + '';
				rsConfig.newState = rsConfigRecord.new_state + '';
				rsConfig.closedState = rsConfigRecord.closed_state + '';
				rsConfig.fulfillerLabel = rsConfigRecord.fullfiller_label + '';
				rsConfig.callerLabel = rsConfigRecord.caller_label + '';
				rsConfig.requestLabel = rsConfigRecord.request_label + '';
				rsConfig.userLocale = gs.getSession().getLanguage();
			}
		}
		return rsConfig;
	},

    type: 'RibbonDataUtil'
};
