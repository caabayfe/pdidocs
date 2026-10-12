var ChangeTemplateSNC = Class.create();
ChangeTemplateSNC.prototype = Object.extendsObject(STTRMTemplate, {

	TEMPLATE_TABLE: "chg_template",

    initialize: function(templateGrOrSysId, _gs) {
        STTRMTemplate.prototype.initialize.call(this, templateGrOrSysId, _gs);
    },

    applyTemplate: function(changeGr) {
		var templateGr = this.getRecord();
		if (templateGr === null)
			return null;

		// Caters for the case where applyTemplate is called with no record
		if (!(changeGr instanceof GlideRecord) && !(changeGr instanceof GlideRecordSecure)) {
			changeGr = new GlideRecord(templateGr.getValue("table"));
			changeGr.newRecord();
		}

		// If there was applying the template, return null.
		if (!STTRMTemplate.prototype.applyTemplate.call(this, changeGr)) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[applyTemplate] Template not applied to " + changeGr.getDisplayValue());

			return null;
		}

		// Set the model and template values on the change
		changeGr.setValue("chg_model", templateGr.getValue("sttrm_model"));
		changeGr.setValue("chg_model_template", templateGr.getUniqueValue());

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[applyTemplate] Template " + templateGr.getDisplayValue() + " applied to " + changeGr.getDisplayValue());

		return changeGr;
    },

    applyChildTemplates: function(changeGr) {
        var templatesApplied = {};

		if (!this.getRecord())
			return templatesApplied;

        var caseSensitiveConditions = (gs.getProperty("com.snc.change_management.template_condition_case_sensitive", "false") == "true");

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.logDebug("[applyChildTemplates] caseSensitiveConditions: " + caseSensitiveConditions);

        var childRecordTemplateGr = new GlideRecord("chg_child_record_template");
        childRecordTemplateGr.addQuery("parent_template", this._gr.getUniqueValue());
        childRecordTemplateGr.addActiveQuery();
        childRecordTemplateGr.query();

        while (childRecordTemplateGr._next()) {
            var condition = childRecordTemplateGr.getValue("condition");
            var matches = false;
            try {
                if (JSUtil.nil(condition))
                    matches = true;
                else {
                    matches = SNC.Filter.checkRecord(changeGr, condition + "", true, caseSensitiveConditions);

                    if (this._log.atLevel(GSLog.DEBUG))
                        this._log.logDebug("[applyChildTemplates] condition: [" + condition + "] on " + changeGr.number + " [" + changeGr.sys_id + "] => " + matches);
                }

                if (matches) {
                    var childRecordGr = new GlideRecord(childRecordTemplateGr.getValue("table"));
                    childRecordGr.initialize();

                    var templateApplied = new GlideTemplate.getFromRecord(childRecordTemplateGr).apply(childRecordGr) === 0 ? true : false;

                    if (templateApplied) {
                        childRecordGr.setValue("change_request", changeGr.getUniqueValue());
                        var childRecordSysId = childRecordGr.insert();
                        if (childRecordSysId)
                            templatesApplied[childRecordTemplateGr.getUniqueValue()] = childRecordSysId;
                    }
                }
            } catch (e) {
                if (this._log.atLevel(GSLog.NOTICE))
                    this._log.logNotice("[applyChildTemplates] condition: [" + condition + "] caught exception " + e);
            }
        }

        return templatesApplied;
    },

    getFieldPolicies: function() {
        var fieldPolicies = {
            hasFieldPolicies: false,
            mandatoryFieldPolicies: [],
            readOnlyFieldPolicies: []
        };

        if (!this.getRecord())
            return fieldPolicies;

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getFieldPolicies] template sys_id: " + this._gr.getUniqueValue());

        var fieldPoliciesGr = new GlideRecord("sttrm_template_field_policy");
        fieldPoliciesGr.addQuery("sttrm_base_template", this._gr.getUniqueValue());
        fieldPoliciesGr.addActiveQuery();
        fieldPoliciesGr.query();
        fieldPolicies.hasFieldPolicies = fieldPoliciesGr.hasNext();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getFieldPolicies] has field policies: " + fieldPolicies.hasFieldPolicies);

        while (fieldPoliciesGr.next()) {
            var fieldName = fieldPoliciesGr.getValue("name");

            if (global.JSUtil.getBooleanValue(fieldPoliciesGr, "mandatory"))
                fieldPolicies.mandatoryFieldPolicies.push(fieldName);

            if (global.JSUtil.getBooleanValue(fieldPoliciesGr, "read_only"))
                fieldPolicies.readOnlyFieldPolicies.push(fieldName);
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getFieldPolicies] field policies: " + JSON.stringify(fieldPolicies));

        return fieldPolicies;
    },

    _getRecordFromReference: function(refGr) {
        var tableName = refGr.getTableName();
        var sysId = refGr.getUniqueValue();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_getRecordFromReference] tableName: " + tableName + " [" + sysId + "]");

        var gr = new GlideRecordSecure(tableName);
        if (!gr.get(sysId))
            this._log.error("[_getRecordFromReference] tableName: " + tableName + " [" + sysId + "] record not found");

        return gr;
    },

    type: "ChangeTemplateSNC"
});

ChangeTemplateSNC.getReferenceQualifier = function() {
    var _log = new GSLog("com.snc.itsm.state_transition_model.log", "ChangeTemplateSNC").setLog4J();

    var modelSysIds = [];

    var chgModelGr = new GlideRecordSecure("chg_model");
    chgModelGr.addActiveQuery();
    chgModelGr.query();
    while (chgModelGr.next()) {
        var chgModel = new STTRMModel(chgModelGr);
        var canProposeTemplate = chgModel.canProposeTemplate();

        if (_log.atLevel(GSLog.DEBUG))
            _log.debug("[getReferenceQualifier] Change Model (" + chgModelGr.name + ") - canProposeTemplate: " + canProposeTemplate);

        // A user who can write a chg_model or can write Template because has access as template proposer
        if (canProposeTemplate)
            modelSysIds.push(chgModelGr.getUniqueValue());
    }

    if (_log.atLevel(GSLog.DEBUG))
        _log.debug("[getReferenceQualifier] modelSysIds.join(): " + modelSysIds.join());

    return "sys_idIN" + modelSysIds.join();
};
