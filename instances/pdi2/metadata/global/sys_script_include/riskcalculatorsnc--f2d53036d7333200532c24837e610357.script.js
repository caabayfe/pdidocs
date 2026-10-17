var RiskCalculatorSNC = Class.create();
RiskCalculatorSNC.LOG_PROPERTY = "com.snc.change_management.risk_conditions.log.level";
RiskCalculatorSNC.CHG_RISK_CONDITIONS_MATCH_ALL_PROPERTY = "com.snc.change_management.risk_conditions.match_all";
RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN = "com.snc.change_management.risk_assessment";
RiskCalculatorSNC.LEGACY_CHG_RISK_ASMT_PLUGIN = "com.snc.change.risk_assessment";
RiskCalculatorSNC.CHG_RISK_ML_PLUGIN = "com.snc.change_management.ml.risk";
RiskCalculatorSNC.CHG_RISK_PROBABILITY_PLUGIN = "com.snc.change_management.success_probability";
RiskCalculatorSNC._setChangeRiskDetails = function(field, value, changeRequestGr) {
    changeRequestGr = changeRequestGr || this.changeRequestGr;
    if (!changeRequestGr || !changeRequestGr.getUniqueValue() || !this.changeRiskDetailsGr)
        return;

    value = ChangeCommon.isNil(value) ? "" : value;
    if (this.changeRiskDetailsGr.isValidField(field)) {
        var currFieldValue = this.changeRiskDetailsGr.getValue(field);
        currFieldValue = ChangeCommon.isNil(currFieldValue) ? "" : currFieldValue;

        if (this.changeRiskDetailsGr.isValidField(field + "_prev"))
            this.changeRiskDetailsGr.setValue(field + "_prev", currFieldValue);

        this.changeRiskDetailsGr.setValue(field, value);

        if (!this._dryRun)
            this.updateChangeRiskDetails();
    }
};
RiskCalculatorSNC._insertChangeRiskConditionDetails = function(ruleSysId, order, risk, impact) {
    if (!this.changeRiskDetailsGr || !this.changeRiskDetailsGr.getUniqueValue())
        return;

    var chgRiskDetailsSysId = this.changeRiskDetailsGr.getUniqueValue();
    var chgRiskCondDetGr = new GlideRecord("change_risk_condition_details");
    chgRiskCondDetGr.addQuery("change_risk_details", chgRiskDetailsSysId);
    chgRiskCondDetGr.addQuery("risk_condition", ruleSysId);
    chgRiskCondDetGr.query();
    if (chgRiskCondDetGr.next())
        return chgRiskCondDetGr;

    chgRiskCondDetGr.setValue("change_risk_details", chgRiskDetailsSysId);
    chgRiskCondDetGr.setValue("risk_condition", ruleSysId);
    chgRiskCondDetGr.setValue("order", order);
    chgRiskCondDetGr.setValue("risk_condition_risk", risk);
    chgRiskCondDetGr.setValue("risk_condition_impact", impact);
    chgRiskCondDetGr.insert();
    return chgRiskCondDetGr;
};
RiskCalculatorSNC._deleteChangeRiskConditionDetails = function() {
    if (!this.changeRiskDetailsGr || !this.changeRiskDetailsGr.getUniqueValue())
        return;

    var chgRiskDetailsSysId = this.changeRiskDetailsGr.getUniqueValue();
    var chgRiskCondDetGr = new GlideRecord("change_risk_condition_details");
    chgRiskCondDetGr.addQuery("change_risk_details", chgRiskDetailsSysId);
    chgRiskCondDetGr.deleteMultiple();
};
RiskCalculatorSNC._initChangeRiskDetails = function(changeRequestGr) {
    changeRequestGr = changeRequestGr || this.changeRequestGr;
    if (!changeRequestGr || !changeRequestGr.getUniqueValue())
        return;

    if (!this.changeRiskDetailsGr) {
        this.changeRiskDetailsGr = new GlideRecord("change_risk_details");
        this.changeRiskDetailsGr.addQuery("change_request", changeRequestGr.getUniqueValue());
        this.changeRiskDetailsGr.query();
        if (!this.changeRiskDetailsGr.next()) {
            this.changeRiskDetailsGr.initialize();
            this.changeRiskDetailsGr.setValue("change_request", changeRequestGr.getUniqueValue());
        }
    }
};
RiskCalculatorSNC.updateChangeRiskDetails = function() {
    if (!this.changeRiskDetailsGr)
        return;

    this.changeRiskDetailsGr.update();
};

RiskCalculatorSNC.prototype = {

    initialize: function(changeRequestGr, changeRiskDetailsGr) {
        this._log = new GSLog(RiskCalculatorSNC.LOG_PROPERTY, this.type);

        // Requery to handle calls from scoped application
        if (changeRequestGr) {
            if (changeRequestGr.operation() !== "insert") {
                this._originalChangeRequestGr = changeRequestGr;
                this.changeRequestGr = new GlideRecord(changeRequestGr.getTableName());
                if (this.changeRequestGr.get(changeRequestGr.getUniqueValue()))
                    this._copyChanges(changeRequestGr);
            } else
                this.changeRequestGr = changeRequestGr;
        }
        this._dryRun = !(changeRequestGr && changeRequestGr.isValidRecord());
        this.hideNotification = false;

        this._riskConditionsMatchAll = gs.getProperty(RiskCalculatorSNC.CHG_RISK_CONDITIONS_MATCH_ALL_PROPERTY, "false") === "true";
        this._riskHelper = new global.ChangeRiskDetailsHelper();
        if (changeRiskDetailsGr)
            this.changeRiskDetailsGr = changeRiskDetailsGr;
        else
            this._initChangeRiskDetails(this.changeRequestGr);
    },

    /**
     * ALL Risk Evaluation should use this method. This function will update the change_request gliderecord
     * unless dryRun has been set to true. Only call in before business rule if dryRun has been set to true.
     *
     * return evaluatedRiskImpact with properties: riskCondition, riskAssessment, riskML and riskEvaluation
     */
    evaluateRiskImpact: function() {
        var evaluatedRiskImpact = {};

        // Risk Assessment plugin active
        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN)) {
            var changeRiskAsmt = new global.ChangeRiskAsmt(this.changeRequestGr, this._originalChangeRequestGr, this.changeRiskDetailsGr);
            changeRiskAsmt.setHideNotification(this.hideNotification);
            if (changeRiskAsmt.hasAssessment() && !changeRiskAsmt.hasCompletedMatchingAssessment())
                evaluatedRiskImpact.errorMsg = gs.getMessage("Complete Risk Assessment to calculate risk");
            else
                evaluatedRiskImpact = this._dryRun ? changeRiskAsmt.setChangeRiskImpact() : changeRiskAsmt.updateChangeRiskImpact();
        } else {
            // Legacy Risk Assessment plugin active
            if (GlidePluginManager.isActive(RiskCalculatorSNC.LEGACY_CHG_RISK_ASMT_PLUGIN))
                evaluatedRiskImpact = this._dryRun ? this.legacySetChangeRiskImpact() : this.legacyUpdateChangeRiskImpact();
            else
                evaluatedRiskImpact = this._dryRun ? this.setChangeRiskImpact() : this.updateChangeRiskImpact();
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[evaluateRiskImpact] dryRun: " + this._dryRun + " evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        evaluatedRiskImpact = this._removeLegacyValues(evaluatedRiskImpact);

        if (!evaluatedRiskImpact.errorMsg)
            this._showInfoMessage(evaluatedRiskImpact);

        return evaluatedRiskImpact;
    },

    _showInfoMessage: function(evaluatedRiskImpact) {
        if (this._riskHelper.getViewDetailsEnabled() === "legacy" && !this.hideNotification) {
            if (evaluatedRiskImpact.riskAssessment && evaluatedRiskImpact.riskAssessment.msg)
                gs.addInfoMessage(evaluatedRiskImpact.riskAssessment.msg);
            if (evaluatedRiskImpact.riskCondition && evaluatedRiskImpact.riskCondition.msg)
                gs.addInfoMessage(evaluatedRiskImpact.riskCondition.msg);
            if (evaluatedRiskImpact.riskML && evaluatedRiskImpact.riskML.msg)
                gs.addInfoMessage(evaluatedRiskImpact.riskML.msg);
            if (evaluatedRiskImpact.calculatedRiskScore && evaluatedRiskImpact.calculatedRiskScore.msg)
                gs.addInfoMessage(evaluatedRiskImpact.calculatedRiskScore.msg);
            if (evaluatedRiskImpact.riskEvaluation && evaluatedRiskImpact.riskEvaluation.risk && evaluatedRiskImpact.riskEvaluation.risk.updatedMsg)
                gs.addInfoMessage(evaluatedRiskImpact.riskEvaluation.risk.updatedMsg);
            return;
        }

        var msgString = "";

        if (evaluatedRiskImpact && evaluatedRiskImpact.riskCondition && evaluatedRiskImpact.riskCondition.impact && (evaluatedRiskImpact.riskCondition.impact.display_value || evaluatedRiskImpact.riskCondition.impact.value))
            evaluatedRiskImpact.riskCondition.msg += "; " + gs.getMessage("Impact: {0}{1}{2}", [new RiskCalculator().getStartColorTag(), evaluatedRiskImpact.riskCondition.impact.display_value || evaluatedRiskImpact.riskCondition.impact.value, new RiskCalculator().getEndColorTag()]);

        var isRiskUpdated = this._isRiskUpdated(evaluatedRiskImpact);
        var isImpactUpdated = this._isImpactUpdated(evaluatedRiskImpact);
        if (!isRiskUpdated && !isImpactUpdated)
            msgString = gs.getMessage('Risk and Impact remain unchanged');
        else if (isRiskUpdated && !isImpactUpdated)
            msgString = gs.getMessage('Risk has been set to {0}{1}{2} and Impact remains unchanged', [this.getStartColorTag(), evaluatedRiskImpact.riskEvaluation.risk.display_value, this.getEndColorTag()]);
        else if (!isRiskUpdated && isImpactUpdated)
            msgString = gs.getMessage('Risk remains unchanged and Impact has been set to {0}{1}{2}', [this.getStartColorTag(), evaluatedRiskImpact.riskEvaluation.impact.display_value, this.getEndColorTag()]);
        else
            msgString = gs.getMessage('Risk has been set to {0}{1}{2} and Impact has been set to {0}{3}{2}', [this.getStartColorTag(), evaluatedRiskImpact.riskEvaluation.risk.display_value, this.getEndColorTag(), evaluatedRiskImpact.riskEvaluation.impact.display_value]);

        this._setChangeRiskDetails("risk_changed", isRiskUpdated, this.changeRequestGr);
        this._setChangeRiskDetails("impact_changed", isImpactUpdated, this.changeRequestGr);

        if (!this.hideNotification) {
            var riskAsmtMatched = (evaluatedRiskImpact && evaluatedRiskImpact.riskAssessment && evaluatedRiskImpact.riskAssessment.risk);
            if (this._riskHelper.showDetailsLink(riskAsmtMatched)) {
                var sanitizedMsgString = SNC.GlideHTMLSanitizer.sanitize(msgString);
                var sanitizedAriaLabel = SNC.GlideHTMLSanitizer.sanitize(gs.getMessage("View details about risk and impact calculation"));
                var sanitizedLinkLabel = SNC.GlideHTMLSanitizer.sanitize(gs.getMessage("View details"));
                gs.addInfoMessageNoSanitization(sanitizedMsgString + ". <a id='chg_risk_details_link' href='javascript:void(0);' onclick='openRiskDetails()' role='button' aria-label='" + sanitizedAriaLabel + "'>" + sanitizedLinkLabel + "</a>");
            } else
                gs.addInfoMessage(msgString);
        } else
            evaluatedRiskImpact.riskEvaluation.msg = msgString;
    },

    _isRiskUpdated: function(evaluatedRiskImpact) {
        return evaluatedRiskImpact && evaluatedRiskImpact.riskEvaluation && evaluatedRiskImpact.riskEvaluation.risk && evaluatedRiskImpact.riskEvaluation.risk.updated;
    },

    _isImpactUpdated: function(evaluatedRiskImpact) {
        return evaluatedRiskImpact && evaluatedRiskImpact.riskEvaluation && evaluatedRiskImpact.riskEvaluation.impact && evaluatedRiskImpact.riskEvaluation.impact.updated;
    },

    legacySetChangeRiskImpact: function() {
        var evaluatedRiskImpact = {};
        var riskAssessmentCalculator = new RiskAssessmentCalculator(this.changeRequestGr, this._originalChangeRequestGr, this.changeRiskDetailsGr);
        var assessmentMatch = riskAssessmentCalculator.checkForMatchingAssessment(this.changeRequestGr.sys_class_name, this.changeRequestGr) + "";
        if (!assessmentMatch) {
            this._setChangeRiskDetails("assessment_master", "", this.changeRequestGr);
            this._setChangeRiskDetails("legacy_risk_assessment", "", this.changeRequestGr);
            evaluatedRiskImpact = riskAssessmentCalculator.calculateRisk(this.changeRequestGr);
            if (evaluatedRiskImpact && evaluatedRiskImpact.riskCondition && evaluatedRiskImpact.riskCondition.sys_id) {
                this._setRiskCondition(evaluatedRiskImpact.riskCondition.sys_id, evaluatedRiskImpact.riskCondition.risk.value, evaluatedRiskImpact.riskCondition.impact.value);
                this._setChangeRiskDetails("risk_condition_has_run", true, this.changeRequestGr);
            }
        } else {
            var riskAssessment = riskAssessmentCalculator.checkForAssessmentInstance(this.changeRequestGr.sys_id) + "";

            if (this._log.atLevel(global.GSLog.DEBUG))
                this._log.debug("[legacyUpdateChangeRiskImpact] riskAssessment: " + riskAssessment + " assessmentMatch: " + assessmentMatch);

            // the correct assessment has been taken
            if (riskAssessment && riskAssessment === assessmentMatch)
                evaluatedRiskImpact = riskAssessmentCalculator.calculateRisk(this.changeRequestGr);

            if (!evaluatedRiskImpact.riskAssessment)
                evaluatedRiskImpact.riskAssessment = {};

            if (riskAssessment && riskAssessment !== assessmentMatch)
                evaluatedRiskImpact.errorMsg = gs.getMessage("Incorrect risk assessment taken, please fill out a new assessment");

            if (!riskAssessment)
                evaluatedRiskImpact.errorMsg = gs.getMessage("A risk assessment is required, please fill out a risk assessment");

            if (evaluatedRiskImpact && evaluatedRiskImpact.riskAssessment && evaluatedRiskImpact.riskAssessment.risk) {
                this._setChangeRiskDetails("assessment_master", evaluatedRiskImpact.riskAssessment.sys_id);
                this._setChangeRiskDetails("legacy_risk_assessment", evaluatedRiskImpact.riskAssessment.risk.value);
                this._setChangeRiskDetails("legacy_risk_assessment_has_run", true, this.changeRequestGr);
            }
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[legacySetChangeRiskImpact] evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        return evaluatedRiskImpact;
    },

    legacyUpdateChangeRiskImpact: function() {
        var evaluatedRiskImpact = this.legacySetChangeRiskImpact();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[legacyUpdateChangeRiskImpact] dryRun: " + this._dryRun + " evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        if (this._shouldUpdateRecord(evaluatedRiskImpact))
            this.changeRequestGr.update();

        if (!evaluatedRiskImpact.errorMsg)
            this._showInfoMessage(evaluatedRiskImpact);

        return evaluatedRiskImpact;
    },

    /**
     * Evaluates riskConditions ONLY. Does not update gliderecord so can be used by before business rule if required.
     *
     * return evaluatedRiskImpact with properties: riskCondition and riskEvaluation
     */
    setChangeRiskImpact: function() {
        var evaluatedRiskImpact = this.calculateRiskConditions();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[setChangeRiskImpact] evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        return this.setRiskImpact(evaluatedRiskImpact);
    },

    /**
     * Sets the evaluated risk and impact on a given Change Request Gliderecord
     *
     * return evaluatedRiskImpact with properties: riskCondition and riskEvaluation
     */
    setRiskImpact: function(evaluatedRiskImpact, changeRequestGr) {
        changeRequestGr = changeRequestGr || this.changeRequestGr;
        evaluatedRiskImpact = evaluatedRiskImpact || {};

        if (!changeRequestGr || !evaluatedRiskImpact.riskEvaluation)
            return evaluatedRiskImpact;

        if (evaluatedRiskImpact.riskEvaluation.risk && (evaluatedRiskImpact.riskEvaluation.risk.updated || changeRequestGr.getElement("risk").changes()))
            changeRequestGr.risk = evaluatedRiskImpact.riskEvaluation.risk.value;

        if (evaluatedRiskImpact.riskEvaluation.impact && (evaluatedRiskImpact.riskEvaluation.impact.updated || changeRequestGr.getElement("impact").changes()))
            changeRequestGr.impact = evaluatedRiskImpact.riskEvaluation.impact.value;

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[setRiskImpact] changeRequestGr.changes: " + changeRequestGr.changes());

        // When it runs by business rule and either Risk Assessment plugin is installed,
        // the current RiskCalculator instance is not aware of changes to change_risk_details because both Legacy Risk Assessment and Risk Assessment v2 create a
        // new RiskCalculator instance, so resetting the record
        if (evaluatedRiskImpact.riskCondition && evaluatedRiskImpact.riskCondition.risk && evaluatedRiskImpact.riskCondition.impact) {
            if (this._dryRun && this._isRiskAssessmentPluginInstalled()) {
                this._setRiskCondition(evaluatedRiskImpact.riskCondition.sys_id, evaluatedRiskImpact.riskCondition.risk.value, evaluatedRiskImpact.riskCondition.impact.value);
                this._setChangeRiskDetails("risk_condition_has_run", true, this.changeRequestGr);
            }
        } else
            this._clearRiskCondition();
        return evaluatedRiskImpact;
    },

    getColor: function() {
        return "red";
    },

    getStartColorTag: function() {
        return "<font color='" + this.getColor() + "'>";
    },

    getEndColorTag: function() {
        return "</font>";
    },

    setDryRun: function(dryRun) {
        this._dryRun = dryRun || false;

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[setDryRun] this._dryRun: " + this._dryRun);

        return this;
    },

    // Because of requery to handle calls from scoped application, need to copy changes to current
    _copyChanges: function(changeRequestGr) {
        var elements = GlideTableDescriptor.get(changeRequestGr.getTableName()).getSchemaList();
        var length = elements.size();
        for (var i = 0; i < length; i++) {
            var elementDescriptor = elements.get(i);
            var column = elementDescriptor.getName();
            if (!column || column.startsWith("sys_") || !changeRequestGr.getElement(column).changes())
                continue;
            this.changeRequestGr.setValue(column, changeRequestGr.getValue(column));
        }
        // Since this is used in before business_rule, ensure reference to current is updated
        changeRequestGr = this.changeRequestGr;
    },

    _removeLegacyValues: function(evaluatedRiskImpact) {
        var result = {};

        if (evaluatedRiskImpact.errorMsg)
            result.errorMsg = evaluatedRiskImpact.errorMsg;

        if (evaluatedRiskImpact.riskCondition)
            result.riskCondition = evaluatedRiskImpact.riskCondition;

        if (evaluatedRiskImpact.riskAssessment)
            result.riskAssessment = evaluatedRiskImpact.riskAssessment;

        if (evaluatedRiskImpact.riskML)
            result.riskML = evaluatedRiskImpact.riskML;

        if (evaluatedRiskImpact.riskEvaluation)
            result.riskEvaluation = evaluatedRiskImpact.riskEvaluation;

        if (evaluatedRiskImpact.calculatedRiskScore)
            result.calculatedRiskScore = evaluatedRiskImpact.calculatedRiskScore;

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_removeLegacyValues] result: " + JSON.stringify(result));

        return result;
    },

    calculateRisk: function() {
        var evaluatedRiskImpact = this.getRiskList();

        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ML_PLUGIN)) {
            var changeRiskML = new sn_chg_ml_risk.ChangeMLRiskCalculator();
            if (changeRiskML.isSolutionEnabled() && changeRiskML.hasActiveSolution()) {
                var predictResult = new sn_chg_ml_risk.ChangeMLRiskCalculator().getPredictedValue(this.changeRequestGr);
                if (predictResult && predictResult.risk) {
                    evaluatedRiskImpact.riskML = predictResult;

                    var evaluatedRiskValue = isNaN(evaluatedRiskImpact.riskML.risk.value) || evaluatedRiskImpact.riskML.risk.value === "" ? "" : parseInt(evaluatedRiskImpact.riskML.risk.value);
                    var currentRiskValue = this.changeRequestGr.risk.nil() ? "" : parseInt(this.changeRequestGr.risk + "");
                    evaluatedRiskImpact.riskML.risk.updated = evaluatedRiskValue !== currentRiskValue || this.changeRequestGr.risk.changes();

                    this._setChangeRiskDetails("risk_ml", evaluatedRiskImpact.riskML.risk.value);
                    this._setChangeRiskDetails("ml_capability_definition_base", predictResult.mlDefSysID);
                } else
                    // ML could not predict a value for the current record
                    this._setChangeRiskDetails("risk_ml", "");
                this._setChangeRiskDetails("risk_ml_has_run", true, this.changeRequestGr);
            } else {
                // Clear ML values
                this._setChangeRiskDetails("risk_ml_has_run", false, this.changeRequestGr);
                this._setChangeRiskDetails("risk_ml", "");
                this._setChangeRiskDetails("ml_capability_definition_base", "");
            }
            this._setChangeRiskDetails("risk_ml_set", changeRiskML.applyRiskValue(), this.changeRequestGr);
        }
        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_PROBABILITY_PLUGIN)) {
            var successProbability = new sn_chg_probability.SuccessProbabilityUtils(this.changeRequestGr);
            var evaluatedImpact;
            if (evaluatedRiskImpact && evaluatedRiskImpact.riskCondition && evaluatedRiskImpact.riskCondition.impact && evaluatedRiskImpact.riskCondition.impact.value)
                evaluatedImpact = evaluatedRiskImpact.riskCondition.impact.value;
            else
                evaluatedImpact = this.changeRequestGr.getValue("impact");
            evaluatedRiskImpact.calculatedRiskScore = {};
            evaluatedRiskImpact.calculatedRiskScore.msg = gs.getMessage("Calculated Risk Score evaluated: Risk: Not Set");
            if (successProbability.evaluateProbabilityModules()) {
                var changeRiskProbability = new sn_chg_probability.ChangeProbabilityRiskCalculator();
                var calculatedRiskScore = changeRiskProbability.calculateRisk(this.changeRequestGr, evaluatedImpact);
                if (calculatedRiskScore && calculatedRiskScore.risk) {
                    evaluatedRiskImpact.calculatedRiskScore = calculatedRiskScore;
                    evaluatedRiskImpact.calculatedRiskScore.risk.updated = parseInt(calculatedRiskScore.risk.value) !== parseInt(this.changeRequestGr.risk) || this.changeRequestGr.risk.changes();
                    evaluatedRiskImpact.calculatedRiskScore.msg = gs.getMessage("Calculated Risk Score evaluated: Risk: {0}{1}{2}", [this.getStartColorTag(), evaluatedRiskImpact.calculatedRiskScore.risk.display_value || evaluatedRiskImpact.calculatedRiskScore.risk.value, this.getEndColorTag()]);
                    this._setChangeRiskDetails("calculated_risk_score_risk", evaluatedRiskImpact.calculatedRiskScore.risk.value);
                    this._setChangeRiskDetails("calculated_risk_score", calculatedRiskScore.sys_id);
                } else {
                    // No record found in lookup table
                    this._setChangeRiskDetails("calculated_risk_score_risk", "");
                    this._setChangeRiskDetails("calculated_risk_score", "");
                }

                evaluatedRiskImpact.calculatedRiskScore.probability = evaluatedRiskImpact.calculatedRiskScore.probability || {};
                evaluatedRiskImpact.calculatedRiskScore.probability.value = this.changeRequestGr.probability;
                evaluatedRiskImpact.calculatedRiskScore.probability.updated = this.changeRequestGr.probability.changes();

                this._setChangeRiskDetails("calculated_risk_score_has_run", true, this.changeRequestGr);
            } else {
                // Clear Prob values as something went wrong in setting probability value
                this._setChangeRiskDetails("calculated_risk_score_has_run", false, this.changeRequestGr);
                this._setChangeRiskDetails("calculated_risk_score", "");
                this._setChangeRiskDetails("calculated_risk_score_risk", "");
            }
        }

        return !evaluatedRiskImpact || !evaluatedRiskImpact.riskCondition || !evaluatedRiskImpact.riskCondition.match ? "" : evaluatedRiskImpact;
    },

    calculateRiskConditions: function() {
        var evaluatedRiskImpact = this.calculateRisk();
        if (!evaluatedRiskImpact || !evaluatedRiskImpact.riskCondition)
            return {};

        evaluatedRiskImpact.riskCondition.msg = evaluatedRiskImpact.riskCondition.msg ? evaluatedRiskImpact.riskCondition.msg += ": " + gs.getMessage("Risk Condition calculated") : gs.getMessage("Risk Condition calculated");

        if (evaluatedRiskImpact.riskCondition && evaluatedRiskImpact.riskCondition.name && evaluatedRiskImpact.riskCondition.name.value) {
            var escapedName = GlideStringUtil.escapeHTML(evaluatedRiskImpact.riskCondition.name.display_value || evaluatedRiskImpact.riskCondition.name.value).replaceAll('"', '"');
            var escapedDescription = "";
            if (evaluatedRiskImpact.riskCondition.description && evaluatedRiskImpact.riskCondition.description.value)
                escapedDescription = GlideStringUtil.escapeHTML(evaluatedRiskImpact.riskCondition.description.display_value || evaluatedRiskImpact.riskCondition.description.value).replaceAll('"', '"');
            evaluatedRiskImpact.riskCondition.msg += ": " + '<strong><span style="cursor:default;" title="' + escapedDescription + '">' + escapedName + "</span></strong>";
        }

        evaluatedRiskImpact = evaluatedRiskImpact || {};
        evaluatedRiskImpact.riskEvaluation = evaluatedRiskImpact.riskEvaluation || {};

        if (evaluatedRiskImpact.riskCondition.risk && (evaluatedRiskImpact.riskCondition.risk.value || evaluatedRiskImpact.riskCondition.risk.value === 0) && !isNaN(evaluatedRiskImpact.riskCondition.risk.value)) {
            evaluatedRiskImpact.riskEvaluation.risk = evaluatedRiskImpact.riskCondition.risk;

            var evaluatedRiskValue = isNaN(evaluatedRiskImpact.riskCondition.risk.value) || evaluatedRiskImpact.riskEvaluation.risk.value === "" ? "" : parseInt(evaluatedRiskImpact.riskCondition.risk.value);
            var currentRiskValue = isNaN(this.changeRequestGr.risk + "") ? "" : parseInt(this.changeRequestGr.risk + "");
            evaluatedRiskImpact.riskEvaluation.risk.updated = evaluatedRiskValue !== currentRiskValue || this.changeRequestGr.risk.changes();

            evaluatedRiskImpact.riskCondition.msg += "; " + gs.getMessage("Risk: {0}{1}{2}", [this.getStartColorTag(), evaluatedRiskImpact.riskCondition.risk.display_value || evaluatedRiskImpact.riskCondition.risk.value, this.getEndColorTag()]);
        }

        if (evaluatedRiskImpact.calculatedRiskScore &&
            evaluatedRiskImpact.calculatedRiskScore.risk &&
            evaluatedRiskImpact.calculatedRiskScore.risk.value && (
                !evaluatedRiskImpact.riskEvaluation ||
                !evaluatedRiskImpact.riskEvaluation.risk ||
                !evaluatedRiskImpact.riskEvaluation.risk.value ||
                parseInt(evaluatedRiskImpact.calculatedRiskScore.risk.value) < parseInt(evaluatedRiskImpact.riskEvaluation.risk.value)))
            evaluatedRiskImpact.riskEvaluation.risk = evaluatedRiskImpact.calculatedRiskScore.risk;

        if (evaluatedRiskImpact.riskML &&
            evaluatedRiskImpact.riskML.apply &&
            evaluatedRiskImpact.riskML.risk &&
            evaluatedRiskImpact.riskML.risk.value && (
                !evaluatedRiskImpact.riskEvaluation ||
                !evaluatedRiskImpact.riskEvaluation.risk ||
                !evaluatedRiskImpact.riskEvaluation.risk.value ||
                parseInt(evaluatedRiskImpact.riskML.risk.value) < parseInt(evaluatedRiskImpact.riskEvaluation.risk.value)))
            evaluatedRiskImpact.riskEvaluation.risk = evaluatedRiskImpact.riskML.risk;

        if ((!evaluatedRiskImpact.riskCondition || !evaluatedRiskImpact.riskCondition.risk || !evaluatedRiskImpact.riskCondition.risk.value) &&
            (!evaluatedRiskImpact.riskEvaluation || !evaluatedRiskImpact.riskEvaluation.risk || !evaluatedRiskImpact.riskEvaluation.risk.value) &&
            (!evaluatedRiskImpact.calculatedRiskScore || !evaluatedRiskImpact.calculatedRiskScore.risk || !evaluatedRiskImpact.calculatedRiskScore.risk.value) &&
            (!evaluatedRiskImpact.riskML || !evaluatedRiskImpact.riskML.risk || !evaluatedRiskImpact.riskML.risk.value)) {
            if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN))
                evaluatedRiskImpact.riskEvaluation.risk = {};
            else {
                // If the Risk is "Leave Alone" then populate risk with the change request risk value
                evaluatedRiskImpact.riskEvaluation.risk = {
                    value: this.changeRequestGr.risk.nil() ? "" : this.changeRequestGr.getValue("risk") || "",
                    display_value: this.changeRequestGr.risk.nil() ? "" : this.changeRequestGr.risk.getDisplayValue() || "",
                    updated: false
                };
                if (evaluatedRiskImpact.riskCondition)
                    evaluatedRiskImpact.riskCondition.msg += "; " + gs.getMessage("Risk unchanged");
            }
        }

        // risk conditions may also set impact
        if (evaluatedRiskImpact.riskCondition.impact && evaluatedRiskImpact.riskCondition.impact.value) {
            evaluatedRiskImpact.riskEvaluation.impact = evaluatedRiskImpact.riskCondition.impact;
            evaluatedRiskImpact.riskEvaluation.impact.updated = this.changeRequestGr.impact + "" !== evaluatedRiskImpact.riskCondition.impact.value + "" || this.changeRequestGr.impact.changes();
            evaluatedRiskImpact.riskCondition.msg += "; " + gs.getMessage("Impact: {0}{1}{2}", [this.getStartColorTag(), evaluatedRiskImpact.riskCondition.impact.display_value || evaluatedRiskImpact.riskCondition.impact.value, this.getEndColorTag()]);
        } else {
            // If the Impact is "Leave Alone" then populate impact with the change request impact value
            evaluatedRiskImpact.riskEvaluation.impact = {
                value: this.changeRequestGr.getValue("impact"),
                display_value: this.changeRequestGr.impact.getDisplayValue(),
                updated: false
            };
            evaluatedRiskImpact.riskCondition.msg += "; " + gs.getMessage("Impact unchanged");
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[calculateRiskConditions] evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        return evaluatedRiskImpact;
    },

    showRiskAssessment: function() {
        // Risk Assessment plugin active
        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN))
            return new global.ChangeRiskAsmt(this.changeRequestGr).showRiskAssessment();
        else
            return false;
    },

    showCalculateRisk: function(changeRequestGr) {
        changeRequestGr = changeRequestGr || this.changeRequestGr;

        if (!changeRequestGr)
            return false;

        // Show Calculate Risk if Risk Assessment completed
        if (this.hasCompletedAssessment(changeRequestGr))
            return true;

        var isUIAction = gs.getProperty("glide.ui.risk_calculate_rule") === "ui_action";
        var isValidData = !changeRequestGr.isNewRecord() && changeRequestGr.isValidRecord() && this.hasRiskConditions();
        var hasAssessment = this.hasAssessment(changeRequestGr);

        return isUIAction && isValidData && !hasAssessment;
    },

    hasAssessment: function(changeRequestGr) {
        changeRequestGr = changeRequestGr || this.changeRequestGr;
        if (!changeRequestGr)
            return false;

        // Risk Assessment plugin active
        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN)) {
            var changeRiskAsmt = new global.ChangeRiskAsmt(changeRequestGr);
            return changeRiskAsmt.hasAssessment();
        }
        return false;
    },

    hasCompletedAssessment: function(changeRequestGr) {
        changeRequestGr = changeRequestGr || this.changeRequestGr;
        if (!changeRequestGr)
            return false;

        // Risk Assessment plugin active
        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN)) {
            var changeRiskAsmt = new global.ChangeRiskAsmt(changeRequestGr);
            return changeRiskAsmt.hasAssessment() && changeRiskAsmt.hasCompletedAssessment();
        }
        return false;
    },

    _shouldUpdateRecord: function(evaluatedRiskImpact) {
        var riskEvaluation = evaluatedRiskImpact.riskEvaluation;
        return !evaluatedRiskImpact.errorMsg &&
            (this.changeRequestGr.changes() || riskEvaluation.risk.updated || riskEvaluation.impact.updated || evaluatedRiskImpact.calculatedRiskScore.probability.updated);
    },

    updateChangeRiskImpact: function() {
        var evaluatedRiskImpact = this.setChangeRiskImpact();
        if (!evaluatedRiskImpact || !evaluatedRiskImpact.riskEvaluation)
            return;

        if (GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_PROBABILITY_PLUGIN)) {
            var probabilityUpdated = evaluatedRiskImpact.calculatedRiskScore && evaluatedRiskImpact.calculatedRiskScore.probability && evaluatedRiskImpact.calculatedRiskScore.probability.updated;
            if (probabilityUpdated)
                this.changeRequestGr.probability = evaluatedRiskImpact.calculatedRiskScore.probability.value;
        } else {
            evaluatedRiskImpact.calculatedRiskScore = {
                probability: {
                    updated: false
                }
            };
        }

        if (this._shouldUpdateRecord(evaluatedRiskImpact))
            this.changeRequestGr.update();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[updateChangeRiskImpact] evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        return evaluatedRiskImpact;
    },

    getRiskList: function() {
        return this._evaluateRiskConditions();
    },

    hasRiskConditions: function() {
        return this._getRiskConditionsGr().hasNext();
    },

    getGlideRecord: function() {
        return this.changeRequestGr;
    },

    setHideNotification: function(hideNotification) {
        this.hideNotification = hideNotification;
        return this;
    },

    _setRiskCondition: function(ruleSysId, riskValue, impactValue) {
        this._setChangeRiskDetails("risk_condition", ruleSysId);
        this._setChangeRiskDetails("risk_condition_risk", riskValue);
        this._setChangeRiskDetails("risk_condition_impact", impactValue);
    },

    _clearRiskCondition: function() {
        this._setRiskCondition("", "", "");
    },

    _evaluateRiskConditions: function() {
        var evaluatedRiskImpact = {
            riskCondition: {
                active: false,
                match: false,
                matchAll: this._riskConditionsMatchAll
            }
        };

        if (this._riskConditionsMatchAll)
            this._deleteChangeRiskConditionDetails();

        var evaluator;
        var riskConditionGr = this._getRiskConditionsGr();
        while (riskConditionGr.next() && (!evaluatedRiskImpact.riskCondition.match || this._riskConditionsMatchAll)) {
            evaluatedRiskImpact.riskCondition.active = true;

            if (JSUtil.getBooleanValue(riskConditionGr, "use_advanced_condition")) {
                if (!evaluator) {
                    evaluator = new GlideScopedEvaluator();
                    evaluator.putVariable("current", this.changeRequestGr);
                    evaluator.putVariable("answer", false);
                }
                evaluator.evaluateScript(riskConditionGr, "advanced_condition");
                evaluatedRiskImpact.riskCondition.match = evaluator.getVariable("answer");
            } else
                evaluatedRiskImpact.riskCondition.match = GlideFilter.checkRecord(this.changeRequestGr, riskConditionGr.condition);

            if (evaluatedRiskImpact.riskCondition.match) {
                evaluatedRiskImpact.riskCondition.sys_id = riskConditionGr.getUniqueValue();

                evaluatedRiskImpact.riskCondition.name = {
                    value: riskConditionGr.getValue("name") || "",
                    display_value: riskConditionGr.name.getDisplayValue() || ""
                };

                evaluatedRiskImpact.riskCondition.order = {
                    value: riskConditionGr.getValue("order") || "",
                    display_value: riskConditionGr.order.getDisplayValue() || ""
                };

                evaluatedRiskImpact.riskCondition.description = {
                    value: riskConditionGr.getValue("description") || "",
                    display_value: riskConditionGr.description.getDisplayValue() || ""
                };

                evaluatedRiskImpact.riskCondition.useScriptValues = {
                    value: riskConditionGr.getValue("use_script_values") || "",
                    display_value: riskConditionGr.use_script_values.getDisplayValue() || ""
                };

                if (JSUtil.getBooleanValue(riskConditionGr, "use_script_values")) {
                    if (!evaluator) {
                        evaluator = new GlideScopedEvaluator();
                        evaluator.putVariable("current", this.changeRequestGr);
                    }
                    evaluator.evaluateScript(riskConditionGr, "script_values");

                    evaluatedRiskImpact.riskCondition.risk = {
                        value: this.changeRequestGr.risk.nil() ? "" : this.changeRequestGr.getValue("risk") || "",
                        display_value: this.changeRequestGr.risk.getDisplayValue() || ""
                    };

                    evaluatedRiskImpact.riskCondition.impact = {
                        value: this.changeRequestGr.impact.nil() ? "" : this.changeRequestGr.getValue("impact") || "",
                        display_value: this.changeRequestGr.impact.getDisplayValue() || ""
                    };
                } else {
                    evaluatedRiskImpact.riskCondition.risk = {
                        value: riskConditionGr.risk.nil() ? "" : riskConditionGr.getValue("risk") || "",
                        display_value: riskConditionGr.risk.nil() ? "" : riskConditionGr.risk.getDisplayValue() || ""
                    };
                    evaluatedRiskImpact.riskCondition.impact = {
                        value: riskConditionGr.impact.nil() ? "" : riskConditionGr.getValue("impact") || "",
                        display_value: riskConditionGr.impact.nil() ? "" : riskConditionGr.impact.getDisplayValue() || ""
                    };
                }

                this._setChangeRiskDetails("risk_condition_has_run", true, this.changeRequestGr);
                this._setChangeRiskDetails("risk_condition_match_all", this._riskConditionsMatchAll, this.changeRequestGr);

                if (!this._riskConditionsMatchAll) {
                    this._setRiskCondition(evaluatedRiskImpact.riskCondition.sys_id, evaluatedRiskImpact.riskCondition.risk.value, evaluatedRiskImpact.riskCondition.impact.value);

                    // Populate legacy values (as customers may have called and expect JSON legacy values)
                    evaluatedRiskImpact.hasValue = evaluatedRiskImpact.riskCondition.match;
                    evaluatedRiskImpact.name = evaluatedRiskImpact.riskCondition.name.value || "";
                    evaluatedRiskImpact.order = evaluatedRiskImpact.riskCondition.order.value || 0;
                    evaluatedRiskImpact.description = evaluatedRiskImpact.riskCondition.description.value || "";
                    evaluatedRiskImpact.impact = evaluatedRiskImpact.riskCondition.impact.value || "";
                    evaluatedRiskImpact.impactLabel = evaluatedRiskImpact.riskCondition.impact.display_value || "";
                    evaluatedRiskImpact.risk = evaluatedRiskImpact.riskCondition.risk.value || "";
                    evaluatedRiskImpact.label = evaluatedRiskImpact.riskCondition.risk.display_value || "";
                    // End of legacy values
                } else {
                    var chgRiskCondDetGr = this._insertChangeRiskConditionDetails(evaluatedRiskImpact.riskCondition.sys_id, evaluatedRiskImpact.riskCondition.order.value, evaluatedRiskImpact.riskCondition.risk.value, evaluatedRiskImpact.riskCondition.impact.value);

                    if (this._log.atLevel(global.GSLog.DEBUG))
                        this._log.debug("[_evaluateRiskConditions] chgRiskCondDetGr: " + JSON.stringify(ChangeCommon.toJS(chgRiskCondDetGr)));
                }
            }
        }

        if (evaluatedRiskImpact.riskCondition.active && evaluatedRiskImpact.riskCondition.match && this._riskConditionsMatchAll) {
            var gr = new GlideRecord("change_risk_condition_details");
            gr.addQuery("change_risk_details", this.changeRiskDetailsGr.getUniqueValue());
            gr.orderBy("risk_condition_risk");
            gr.orderBy("order");
            gr.setLimit(1);
            gr.query();
            if (gr.next()) {
                this.riskConditionGr = new GlideRecord("risk_conditions");
                var riskConditionSysId = gr.getValue("risk_condition");
                if (riskConditionGr.get(riskConditionSysId)) {
                    evaluatedRiskImpact.riskCondition.sys_id = riskConditionGr.getUniqueValue();
                    evaluatedRiskImpact.riskCondition.name = {
                        value: riskConditionGr.getValue("name") || "",
                        display_value: riskConditionGr.name.getDisplayValue() || ""
                    };
                    evaluatedRiskImpact.riskCondition.order = {
                        value: riskConditionGr.getValue("order") || "",
                        display_value: riskConditionGr.order.getDisplayValue() || ""
                    };
                    evaluatedRiskImpact.riskCondition.description = {
                        value: riskConditionGr.getValue("description") || "",
                        display_value: riskConditionGr.description.getDisplayValue() || ""
                    };
                    evaluatedRiskImpact.riskCondition.useScriptValues = {
                        value: riskConditionGr.getValue("use_script_values") || "",
                        display_value: riskConditionGr.use_script_values.getDisplayValue() || ""
                    };
                    evaluatedRiskImpact.riskCondition.risk = {
                        value: gr.risk_condition_risk,
                        display_value: this._getLabelByValue("risk", gr.risk_condition_risk)
                    };
                    evaluatedRiskImpact.riskCondition.impact = {
                        value: gr.risk_condition_impact,
                        display_value: this._getLabelByValue("impact", gr.risk_condition_impact)
                    };
                    this._setRiskCondition(gr.risk_condition, gr.risk_condition_risk, gr.risk_condition_impact);
                }
            }
        }

        if (evaluatedRiskImpact.riskCondition.active && !evaluatedRiskImpact.riskCondition.match && !this._dryRun) {
            evaluatedRiskImpact.riskCondition.msg = gs.getMessage("No matching Risk Conditions - Risk and Impact unchanged");
            this._clearRiskCondition();
        } else if (!evaluatedRiskImpact.riskCondition.active) {
            evaluatedRiskImpact.riskCondition.msg = gs.getMessage("No active Risk Conditions - Risk and Impact unchanged");
            this._clearRiskCondition();
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_evaluateRiskConditions] evaluatedRiskImpact: " + JSON.stringify(evaluatedRiskImpact));

        return evaluatedRiskImpact;
    },

    _getLabelByValue: function(field, value) {
        var label = "";
        var typeChoiceGr = new GlideSysChoice("change_request", field).getChoices();
        while (typeChoiceGr.next()) {
            if (typeChoiceGr.getValue("inactive") === "1")
                continue;

            if (typeChoiceGr.getValue("value") === value + "") {
                label = typeChoiceGr.getDisplayValue("label");
                break;
            }
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_getLabelByValue] field: " + field + " value: " + value + " label:" + label);

        return label;
    },

    _getRiskConditionsGr: function() {
        if (this.riskConditionGr)
            this.riskConditionGr.restoreLocation();
        else {
            this.riskConditionGr = new GlideRecord("risk_conditions");
            this.riskConditionGr.addActiveQuery();
            this.riskConditionGr.orderBy("order");
            this.riskConditionGr.query();
        }
        return this.riskConditionGr;
    },

    _isRiskAssessmentPluginInstalled: function() {
        return GlidePluginManager.isActive(RiskCalculatorSNC.CHG_RISK_ASMT_PLUGIN) || GlidePluginManager.isActive(RiskCalculatorSNC.LEGACY_CHG_RISK_ASMT_PLUGIN);
    },

    _initChangeRiskDetails: RiskCalculatorSNC._initChangeRiskDetails,
    _setChangeRiskDetails: RiskCalculatorSNC._setChangeRiskDetails,
    _insertChangeRiskConditionDetails: RiskCalculatorSNC._insertChangeRiskConditionDetails,
    _deleteChangeRiskConditionDetails: RiskCalculatorSNC._deleteChangeRiskConditionDetails,
    updateChangeRiskDetails: RiskCalculatorSNC.updateChangeRiskDetails,

    type: "RiskCalculatorSNC"
};
