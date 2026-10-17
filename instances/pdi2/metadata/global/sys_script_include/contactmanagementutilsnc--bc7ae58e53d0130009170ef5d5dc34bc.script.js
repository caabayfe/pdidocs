var ContactManagementUtilSNC = Class.create();
ContactManagementUtilSNC.prototype = {
	initialize: function() {},

	TABLES: {
		CONTACT: 'contact'
	},

	COLUMNS: {
		TABLE: 'table',
		DOCUMENT: 'document',
	},

	CONTACT_TYPE: {
		USER: 'sys_user',
		GROUP: 'sys_user_group',
		CONSUMER: 'csm_consumer',
		RECIPIENT: 'sn_publications_recipients_list'
	},

	liveFeedFollow: function(gr) {
		new GlideappLiveFeedUIAction().follow(gr);
	},

	addRecipients: function(commPlanTable, commPlanSysId, recipients) {
		if (!this.canManageRecipients())
			return false;
		if (!recipients.add_list)
			recipients.add_list = [];
		if (!recipients.delete_list)
			recipients.delete_list = [];

		var commPlanGr = new GlideRecord(commPlanTable);
		if (commPlanGr.get(commPlanSysId)) {
			var existingRecipientsGr = new GlideRecord(this.TABLES.CONTACT);
			existingRecipientsGr.addQuery(this.COLUMNS.TABLE, commPlanGr.getRecordClassName());
			existingRecipientsGr.addQuery(this.COLUMNS.DOCUMENT, commPlanGr.getUniqueValue());
			existingRecipientsGr.addQuery('sys_id', 'IN', recipients.delete_list.join(','));
			existingRecipientsGr.query();
			while(existingRecipientsGr.next()) {
				if (existingRecipientsGr.canDelete())
					existingRecipientsGr.deleteRecord();
			}
			for (var i = 0;i < recipients.add_list.length; i++) {
				var recipient = recipients.add_list[i];
				var contactGr = new GlideRecord(this.TABLES.CONTACT);
				contactGr.newRecord();
				contactGr.table = commPlanTable;
				contactGr.document = commPlanGr.getUniqueValue();
				contactGr.responsibility = recipient.responsibility.value;
				contactGr.type = recipient.type.value;
				contactGr.classification = 'manual';
				switch (recipient.type.value) {
					case this.CONTACT_TYPE.USER:
						contactGr.user = recipient.user.value;
						break;
					case this.CONTACT_TYPE.GROUP:
						contactGr.group = recipient.group.value;
						break;
					case this.CONTACT_TYPE.CONSUMER:
						contactGr.consumer = recipient.consumer.value;
						break;
					case this.CONTACT_TYPE.RECIPIENT:
						contactGr.recipient_list = recipient.recipient_list.value;
						break;
					default:
						gs.log("Not a valid contact Type");
				}
				contactGr.insert();
			}
		}
		return true;
	},

	canManageRecipients: function() {
		var contactsGr = new GlideRecord(this.TABLES.CONTACT);
		return contactsGr.canWrite() && contactsGr.canDelete();
	},

	canManageRecipient: function(contactGr) {
		return contactGr.canWrite() && contactGr.canDelete();
	},

	getRefQualForResponsibilityContactTable: function(contactGr) {
		if (contactGr.table == 'incident_alert') {
			return 'tableISEMPTY^ORtable=incident';
		} else if (contactGr.document.source) {
			return 'tableISEMPTY^ORtable=' + contactGr.document.getRefRecord().source.getRefRecord().getRecordClassName();
		} else
			return 'tableISEMPTY';
	},

	getExistingContacts: function(planGr) {
		var existingContact = [];
		var delContacts = new GlideRecord(this.TABLES.CONTACT);
		delContacts.addQuery(this.COLUMNS.TABLE, planGr.getRecordClassName());
		delContacts.addQuery(this.COLUMNS.DOCUMENT, planGr.sys_id);
		delContacts.addDomainQuery(planGr);
		delContacts.query();
		while (delContacts.next()) {
			var options = delContacts.type + '';
			if (options == this.CONTACT_TYPE.USER) {
				existingContact.push(delContacts.user + '');
			} else if (options == this.CONTACT_TYPE.GROUP) {
				existingContact.push(delContacts.group + '');
			} else if (options == this.CONTACT_TYPE.CONSUMER) {
				existingContact.push(delContacts.consumer + '');
			} else if (options == this.CONTACT_TYPE.RECIPIENT) {
				existingContact.push(delContacts.recipient_list + '');
			}
		}
		return existingContact;
	},

	type: 'ContactManagementUtilSNC'
};
