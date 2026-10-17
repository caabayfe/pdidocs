var PwdResetUXFMainProcessor = Class.create();
PwdResetUXFMainProcessor.prototype = {
    initialize: function() {},

    canAccess: function(table, sysID) {
        if (gs.nil(table) || gs.nil(sysID))
            return false;
        var extensionPoints = new GlideScriptedExtensionPoint().getExtensions("sn_uib_pwd_reset.PwdResetUXFPreLoadValidation");
        for (var i = 0; i < extensionPoints.length; i++) {
            var extension = extensionPoints[i];
            if (typeof extension.retrievePwdResetOwner === 'function') {
                var pwdResetOwner = extension.retrievePwdResetOwner(table, sysID);
                if (!gs.nil(pwdResetOwner) && pwdResetOwner === gs.getUser().getID()) {
                    return true;
                }
            }
        }
        return false;
    },

    constants: {
        INCIDENT_TABLE: "incident",
        INTERACTION_TABLE: "interaction",
        INTERACTION_INCIDENT_M2M_TABLE: "interaction_related_record",
        INCIDENT_FIELD_CALLER_ID: "caller_id",
        INCIDENT_FIELD_URGENCY: "urgency",
        INCIDENT_FIELD_IMPACT: "impact",
        INCIDENT_FIELD_CATEGORY: "category",
        INCIDENT_FIELD_SHORT_DESC: "short_description",
        CATEGORY_PASSWORD_RESET: "password_reset",
        DOCUMENT_TABLE_FIELD: "document_table",
        DOCUMENT_ID_FIELD: "document_id",
        FIELD_VALUE_MEDIUM: 2
    },

    getRecordDetails: function(table, sysID, shortDescription) {
        var result = this._getIncidentDetailsDefaultTemplate();
        if (gs.nil(table) || gs.nil(sysID))
            return result;

        var gr = new GlideRecord(this.constants.INCIDENT_TABLE);
        if (table === this.constants.INCIDENT_TABLE) {
            if (!gr.get(sysID))
                return result;

            result.isValid = true;
            result.assignedTo = gr.assigned_to.toString();
            result.impact = gr.impact.toString();
        } else if (table === this.constants.INTERACTION_TABLE) {
            var interactionGr = new GlideRecord(this.constants.INTERACTION_TABLE);
            if (!interactionGr.get(sysID))
                return result;

            gr.initialize();
            gr.setValue(this.constants.INCIDENT_FIELD_CALLER_ID, interactionGr.assigned_to.toString());
            gr.setValue(this.constants.INCIDENT_FIELD_URGENCY, this.constants.FIELD_VALUE_MEDIUM);
            gr.setValue(this.constants.INCIDENT_FIELD_IMPACT, this.constants.FIELD_VALUE_MEDIUM);
            gr.setValue(this.constants.INCIDENT_FIELD_SHORT_DESC, shortDescription);
            gr.setValue(this.constants.INCIDENT_FIELD_CATEGORY, this.constants.CATEGORY_PASSWORD_RESET);
            gr.setValue();

            result.isValid = true;
            result.incidentSysId = gr.insert();

            var interactionIncidentGr = new GlideRecord(this.constants.INTERACTION_INCIDENT_M2M_TABLE);
            interactionIncidentGr.initialize();
            interactionIncidentGr.setValue(this.constants.INTERACTION_TABLE, sysID);
            interactionIncidentGr.setValue(this.constants.DOCUMENT_TABLE_FIELD, this.constants.INCIDENT_TABLE);
            interactionIncidentGr.setValue(this.constants.DOCUMENT_ID_FIELD, result.incidentSysId);
            interactionIncidentGr.insert();
        }
        return result;
    },

    _getIncidentDetailsDefaultTemplate: function() {
        return {
            isValid: false,
            assignedTo: "",
            impact: "",
            incidentSysId: ""
        };
    },

    type: 'PwdResetUXFMainProcessor'
};
