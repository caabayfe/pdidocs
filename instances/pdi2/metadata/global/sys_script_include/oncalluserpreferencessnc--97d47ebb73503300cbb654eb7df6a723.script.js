var OnCallUserPreferencesSNC = Class.create();
OnCallUserPreferencesSNC.prototype = {
	initialize: function (_gs) {
		this._gs = _gs || gs;
		this._log = new GSLog('com.snc.on_call_rotation.log.level', this.type);
		this._onCallCommon = new OnCallCommon();
		this._onCallConstants = new global.OnCallConstants();
		this._occpUtils = new OnCallContactPreferenceUtil();
		this._communicationTypes = [];
		for (var key in this._occpUtils.COMMUNICATION_TYPES)
			this._communicationTypes.push(this._occpUtils.COMMUNICATION_TYPES[key]);
	},

	TABLES: {
		USER_CONTACT_PREFERENCE: 'on_call_user_contact_preference',
		SYS_ON_CALL_CONTACT_SOURCE: 'sys_on_call_contact_source',
		CMN_NOTIF_DEVICE: 'cmn_notif_device',
		SYS_USER: 'sys_user',
		CMN_ROTA: 'cmn_rota',
		CMN_ROTA_CONTACT_PREFERENCE: 'cmn_rota_contact_preference',
		CMN_ROTA_ESCALATION_SET: 'cmn_rota_escalation_set',
		SYS_USER_GROUP: 'sys_user_group',
		SYS_USER_GRMEMBER: 'sys_user_grmember',
		ON_CALL_COMMUNICATION_TYPE: 'on_call_communication_type'
	},

	ROTA_PREFERENCE_TYPES: {
		ROTA: 'rota',
		ESCALATION_SET: 'escalation_set'
	},

	getUserPreferenceDetails: function (userPreferenceGr) {
		var userPreferenceDetails = this._onCallCommon.toJS(userPreferenceGr, ["name", "schedule_type", "start_time", "end_time", "schedule", "days_of_week"]);

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug('[getUserPreferenceDetails] userPreferenceDetails: ' + JSON.stringify(userPreferenceDetails));

		return userPreferenceDetails;
	},

	getUserContactPreferences: function (userPreferenceSysId, userSysId) {
		var contactAttempts = [];
		var userContactPreferenceGr = new GlideRecord(this.TABLES.USER_CONTACT_PREFERENCE);
		userContactPreferenceGr.addQuery("on_call_user_preference", userPreferenceSysId);
		userContactPreferenceGr.orderBy('contact_attempt');
		userContactPreferenceGr.query();
		while (userContactPreferenceGr.next())
			contactAttempts.push(this.convertUserContactPreferenceToJS(userContactPreferenceGr));

		return contactAttempts;
	},

	convertUserContactPreferenceToJS: function (userContactPreferenceGr) {
		var oobChannels = ['sms', 'email', 'voice', 'mobile_notification', 'teams', 'slack'];
		var userPreferenceFields =  this._onCallCommon.getAllCommunicationChannels();
		for (var i = 0; i < userPreferenceFields.length; i++) {
			var channel = userPreferenceFields[i];
			if (oobChannels.indexOf(channel) === -1) {
				userPreferenceFields[i] = 'u_' + channel;
			}
		}
		userPreferenceFields.push("contact_attempt");
		userPreferenceFields.push("devices");
		var userContactPreference = this._onCallCommon.toJS(userContactPreferenceGr,userPreferenceFields);

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug('[convertUserContactPreferenceToJS] userContactPreference: ' + JSON.stringify(userContactPreference));

		return userContactPreference;
	},

	getUserDevicesAndContacts: function (userSysId) {
		var userDevicesAndContacts = {};
		var onCallCommon = this._onCallCommon;
		var onCallConstants = this._onCallConstants;

		userDevicesAndContacts.devices = [];
		var notifyDeviceGr = new GlideRecord(this.TABLES.CMN_NOTIF_DEVICE);
		notifyDeviceGr.addActiveQuery();
		notifyDeviceGr.addQuery('user', userSysId);
		notifyDeviceGr.query();
		while (notifyDeviceGr.next()) {
			var device = this._occpUtils.getPreferenceFromDevice(notifyDeviceGr);
			if(notifyDeviceGr.name == "Primary email")
			{
				device.name = gs.getMessage("Primary email");
			}
			else
			{
				device.name = notifyDeviceGr.name + "";
			}
			device.sys_id = notifyDeviceGr.sys_id + "";
			device.table_name = this.TABLES.CMN_NOTIF_DEVICE;
			userDevicesAndContacts.devices.push(device);
		}

		userDevicesAndContacts.contacts = [];
		var contactSourceGr = new GlideRecord(this.TABLES.SYS_ON_CALL_CONTACT_SOURCE);
		contactSourceGr.addActiveQuery();
		contactSourceGr.query();
		while (contactSourceGr.next()) {
			var contacts = this.getPreferenceFromSource(contactSourceGr, userSysId);
			for (var f = 0; f < contacts.length; f++) {
				contact = contacts[f];
				if (contact) {
					if (contact.source_type === onCallConstants.COMMUNICATION_CHANNEL.TEAMS && (!(onCallCommon.isTeamsPluginInstalled()) || !(onCallCommon.isVAPluginInstalled()) || !(onCallCommon.isVASetup())))
						continue;
					if (contact.source_type === onCallConstants.COMMUNICATION_CHANNEL.SLACK && (!onCallCommon.isSlackPluginInstalled() || !new global.OnCallSlackUtils().isSlackConfigured()))
						continue;
					if (contact.source_type === onCallConstants.COMMUNICATION_CHANNEL.MOBILE_NOTIFICATION && !onCallCommon.isMobilePushInstalled())
						continue;
					contact.name = contactSourceGr.name + "";
					contact.sys_id = contactSourceGr.sys_id + "";
					contact.table_name = this.TABLES.SYS_ON_CALL_CONTACT_SOURCE;
					var isDuplicate = userDevicesAndContacts.contacts.some(function(existingContact) {
						return JSON.stringify(existingContact) === JSON.stringify(contact);
					});
					if (!isDuplicate)
						userDevicesAndContacts.contacts.push(contact);
				}
			}
		}

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug('[getUserDevicesAndContacts] userDevicesAndContacts: ' + JSON.stringify(userDevicesAndContacts));

		return userDevicesAndContacts;
	},

	getPreferenceFromSource: function (contactSourceGr, userSysId) {
		var sourceTable = contactSourceGr.table + '';
		var userField = 'sys_id';
		if (sourceTable !== this.TABLES.SYS_USER)
			userField = contactSourceGr.user_field + '';

		var sourceTableGr = new GlideRecord(sourceTable);
		sourceTableGr.addQuery(userField, userSysId);
		sourceTableGr.setLimit(1);
		sourceTableGr.query();
		if (sourceTableGr.next()) {
			var preferences = [];
			
			var eps = new GlideScriptedExtensionPoint().getExtensions("global.OnCallCommunication");

			for (var i = 0; i < eps.length; i++) {
				var preference = {
					source_type: contactSourceGr.getValue("source_type")
				};
				if (eps[i].checkContactSourceType(contactSourceGr)) {
					eps[i].setPreferenceFromContactSource(preference, contactSourceGr, sourceTableGr);
					preferences.push(preference);
				}
			}

			return preferences;
		}
	},

	getScheduleDetails: function (schedule) {
		var scheduleDetails = {};
		if (schedule) {
			scheduleDetails.name = schedule.name + "";
			scheduleDetails.id = schedule.sys_id + "";
		}
		return scheduleDetails;
	},

	getContactOverridesForGroup: function (userSysId, groupSysId, isScheduleDetailsNeeded) {
		var shifts = [];
		var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
		rotaGr.addQuery('group', groupSysId);
		rotaGr.addActiveQuery();
		rotaGr.query();
		while (rotaGr.next()) {
			var groupEscalationGr = new OnCallRotation().getGroupEscalationGr(rotaGr.getUniqueValue());
			var shift = {};
			shift.details = this._onCallCommon.toJS(rotaGr, ['name', 'group']);
			if (isScheduleDetailsNeeded) shift.scheduleDetails = this.getScheduleDetails(rotaGr.schedule);

			if (!rotaGr.use_custom_escalation && !groupEscalationGr) {
				var overrideUserContactPreference = rotaGr.override_user_contact_preference + '' === 'true';
	
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.logDebug('[getContactOverridesForGroup] overrideUserContactPreference: ' + overrideUserContactPreference);

				if (overrideUserContactPreference)
					shift.shift_level_override = this.getOverridesForShift(this.ROTA_PREFERENCE_TYPES.ROTA, rotaGr.sys_id + "");
			} else {
				var escalationSetGr = new GlideRecord(this.TABLES.CMN_ROTA_ESCALATION_SET);
				escalationSetGr.addActiveQuery();
				if (groupEscalationGr)
					escalationSetGr.addQuery('group_escalation', groupEscalationGr.sys_id + "");
				else
					escalationSetGr.addQuery('cmn_rota', rotaGr.sys_id + "");
				escalationSetGr.query();
				shift.escalation_sets = [];
				while (escalationSetGr.next()) {
					var escalationOverrideUserContactPreference = escalationSetGr.override_user_contact_preference + '' === 'true';

					if (this._log.atLevel(GSLog.DEBUG))
						this._log.logDebug('[getContactOverridesForGroup] escalationOverrideUserContactPreference: ' + escalationOverrideUserContactPreference);

					if (escalationOverrideUserContactPreference) {
						var escalcationSet = {};
						escalcationSet.details = this._onCallCommon.toJS(escalationSetGr, ['name', 'default']);
						escalcationSet.details.isGroupEscalation = !JSUtil.nil(groupEscalationGr);
						escalcationSet.escalation_set_level_override = this.getOverridesForShift(this.ROTA_PREFERENCE_TYPES.ESCALATION_SET, escalationSetGr.sys_id + "");
						if (escalcationSet.escalation_set_level_override.length)
							shift.escalation_sets.push(escalcationSet);
					}
				}
			}
			if (shift.shift_level_override || shift.escalation_sets.length)
				shifts.push(shift);
		}
		return shifts;
	},

	getOverridesForShift: function (type, sysId) {
		var rotaContactPreferenceGr = new GlideRecord(this.TABLES.CMN_ROTA_CONTACT_PREFERENCE);
		if (type === this.ROTA_PREFERENCE_TYPES.ROTA) {
			rotaContactPreferenceGr.addQuery('cmn_rota', sysId);
			rotaContactPreferenceGr.addQuery('type', this.ROTA_PREFERENCE_TYPES.ROTA);
		} else if (type === this.ROTA_PREFERENCE_TYPES.ESCALATION_SET) {
			rotaContactPreferenceGr.addQuery('cmn_rota_escalation_set', sysId);
			rotaContactPreferenceGr.addQuery('type', this.ROTA_PREFERENCE_TYPES.ESCALATION_SET);
		}
		rotaContactPreferenceGr.orderBy('contact_attempt');
		rotaContactPreferenceGr.query();
		var contactPreferences = [];
		while (rotaContactPreferenceGr.next()) {
			var contactPreference = this._onCallCommon.toJS(rotaContactPreferenceGr, ['contact_attempt', 'communication_types']);
			contactPreferences.push(contactPreference);
		}
		return contactPreferences;
	},

	deleteNotifDevices: function (deviceSysIds) {
		if (!deviceSysIds.length) return false;

		var notifGr = new GlideRecord(this.TABLES.CMN_NOTIF_DEVICE);
		notifGr.addQuery('sys_id', 'IN', deviceSysIds.toString());
		notifGr.query();

		while (notifGr.next()) {
			if (notifGr.canDelete()) notifGr.deleteRecord();
		}
		return true;
	},

	getRotaContactPreferenceCommunicationTypes: function () {
		var communicationTypeGr = new GlideRecord(this.TABLES.ON_CALL_COMMUNICATION_TYPE);
		communicationTypeGr.query();
		var communicationTypes = [];
		while (communicationTypeGr.next())
			communicationTypes.push(this._onCallCommon.toJS(communicationTypeGr, ['type']));
		return communicationTypes;
	},

	/*
	 * Get groups that user belongs to or manages
	 */
	getGroups: function () {
		var groups = {}, filterGroups = [];
		var userSysId = gs.getUserID();
		this._populateMemberGroups(groups, userSysId);
		Object.keys(groups).forEach(function (groupId) {
			filterGroups.push(groupId);
		});
		return filterGroups;
	},

	/*
	 * Get groups that user belongs to.
	 */
	_populateMemberGroups: function (groups, userSysId) {
		var userMemberGr = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
		userMemberGr.addQuery('user', userSysId);
		userMemberGr.addQuery('group.active', 'true');
		userMemberGr.addEncodedQuery('JOINsys_user_grmember.group=cmn_rota.group!active=true');
		userMemberGr.query();
		var memberGroupGr = new GlideRecord(this.TABLES.SYS_USER_GROUP);
		while (userMemberGr.next())
			if (!groups[userMemberGr.group + ""] && memberGroupGr.get(userMemberGr.group + ""))
				groups[userMemberGr.group + ""] = true;
	},

	getHighestOrderContactAttempt: function (userPreferenceSysId, needsACLCheck) {
		if (!userPreferenceSysId)
			return -1;
		var contactPrefGr = new GlideRecord(this.TABLES.USER_CONTACT_PREFERENCE);
		contactPrefGr.addQuery('on_call_user_preference', userPreferenceSysId);
		contactPrefGr.addNotNullQuery('contact_attempt');
		contactPrefGr.orderByDesc('contact_attempt');
		contactPrefGr.setLimit(1);
		contactPrefGr.query();
		if (contactPrefGr.next()) {
			if(needsACLCheck && !contactPrefGr.canRead()) return;
			return parseInt(contactPrefGr.getValue('contact_attempt'));
		}
		return 0;
	},

	canCreateUserPreferences: function() {
		var ocCalendarUtils = new global.OCCalendarUtils();
		return ocCalendarUtils.canRead();
	},

	type: 'OnCallUserPreferencesSNC'
};
