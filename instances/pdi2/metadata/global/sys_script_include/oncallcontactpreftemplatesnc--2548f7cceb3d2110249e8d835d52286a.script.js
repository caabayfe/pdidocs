var OnCallContactPrefTemplateSNC = Class.create();
OnCallContactPrefTemplateSNC.prototype = {
    initialize: function() {
		this.TABLES = {
			CONTACT_PREFERENCE_TEMPLATE: "on_call_template_contact_preference",
			CONTACT_ATTEMPT_TEMPLATE: "on_call_template_contact_attempt",
			ESCALATION_SET: "cmn_rota_escalation_set",
			SHIFT_CONTACT_PREFERENCE: "cmn_rota_contact_preference"
		};

		this.FIELDS = {
			CONTACT_ATTEMPT_TEMPLATE: {
				CONTACT_ATTEMPT: "contact_attempt",
				ATTEMPT_NAME: "attempt_name",
				COMMUNICATION_TYPE: "communication_type",
				PREFERENCE_TEMPLATE: "preference_template"
			},
			SHIFT_CONTACT_PREFERENCE: {
				TYPE: "type",
				ESCALATION_SET: "cmn_rota_escalation_set",
				CONTACT_ATTEMPT: "contact_attempt",
				COMMUNICATION_TYPE: "communication_types"
			}
		};

		this.CONTACT_PREF_TYPE = "escalation_set";
    },

	_getRecord: function(table, sysId) {
		var gr = new GlideRecord(table);
		if (gr.get(sysId))
			return gr;
		return null;
	},

	_getContactAttemptTemplates: function(contactPrefTemplateSysId) {
		var contactAttemptTemplate = new GlideRecord(this.TABLES.CONTACT_ATTEMPT_TEMPLATE);
		contactAttemptTemplate.addQuery(this.FIELDS.CONTACT_ATTEMPT_TEMPLATE.PREFERENCE_TEMPLATE, contactPrefTemplateSysId);
		contactAttemptTemplate.orderBy(this.FIELDS.CONTACT_ATTEMPT_TEMPLATE.CONTACT_ATTEMPT);
		contactAttemptTemplate.query();

		return contactAttemptTemplate;
	},

	_copyAttempts: function(contactAttemptTemplateGr, escalationSetGr) {
		var contactPreferenceGr = new GlideRecord(this.TABLES.SHIFT_CONTACT_PREFERENCE);
		contactPreferenceGr.initialize();

		contactPreferenceGr[this.FIELDS.SHIFT_CONTACT_PREFERENCE.CONTACT_ATTEMPT] = contactAttemptTemplateGr[this.FIELDS.CONTACT_ATTEMPT_TEMPLATE.CONTACT_ATTEMPT];
		contactPreferenceGr[this.FIELDS.SHIFT_CONTACT_PREFERENCE.COMMUNICATION_TYPE] = contactAttemptTemplateGr[this.FIELDS.CONTACT_ATTEMPT_TEMPLATE.COMMUNICATION_TYPE];
		contactPreferenceGr[this.FIELDS.SHIFT_CONTACT_PREFERENCE.TYPE] = this.CONTACT_PREF_TYPE;
		contactPreferenceGr[this.FIELDS.SHIFT_CONTACT_PREFERENCE.ESCALATION_SET] = escalationSetGr.getUniqueValue();

		contactPreferenceGr.insert();
	},

	_isAttemptExistAlready: function(escalationSetSysId) {
		var contactPrefAggr = new GlideAggregate(this.TABLES.SHIFT_CONTACT_PREFERENCE);
		contactPrefAggr.addQuery(this.FIELDS.SHIFT_CONTACT_PREFERENCE.ESCALATION_SET, escalationSetSysId);
		contactPrefAggr.addAggregate("COUNT");
		contactPrefAggr.query();

		if(contactPrefAggr.next() && contactPrefAggr.getAggregate("COUNT") > 0) {
			return true;
		}

		return false;
	},

	/*
	* Copy contact preference attempts based on the contact preference attempt templates
	*/
	copyContactPreferences: function(templateSysId, escalationSetSysId) {
		var result = {
			error: "",
			warning: ""
		};
		var contactPreferenceTemplateGr = this._getRecord(this.TABLES.CONTACT_PREFERENCE_TEMPLATE, templateSysId);
		if (!contactPreferenceTemplateGr) {
			result.error = gs.getMessage("Provided template sys_id is not valid");
			return result;
		}

		var escalationSetGr = this._getRecord(this.TABLES.ESCALATION_SET, escalationSetSysId);
		if (!escalationSetGr) {
			result.error =  gs.getMessage("Provided escalation set sys_id is not valid");
			return result;
		}

		if (this._isAttemptExistAlready(escalationSetSysId)) {
			result.error = gs.getMessage("Contact preferences already exist");
			return result;
		}

		var contactAttemptTemplateGr = this._getContactAttemptTemplates(templateSysId);
		while(contactAttemptTemplateGr.next()) {
			this._copyAttempts(contactAttemptTemplateGr, escalationSetGr);
		}

		return result;
	},

	deleteContactPreferenceAttempts: function (escalationSetSysId) {
		var contactPrefGr = new GlideRecord(this.TABLES.SHIFT_CONTACT_PREFERENCE);
		contactPrefGr.addQuery(this.FIELDS.SHIFT_CONTACT_PREFERENCE.ESCALATION_SET, escalationSetSysId);
		contactPrefGr.query();

		contactPrefGr.setWorkflow(false); 
		contactPrefGr.deleteMultiple();
	},

    type: 'OnCallContactPrefTemplateSNC'
};
