var ChangeRiskDetailsHelperSNC = Class.create();
ChangeRiskDetailsHelperSNC.prototype = {

	ML_RISK_PLUGIN: "com.snc.change_management.ml.risk",
	LOG_PROPERTY: "com.snc.change_request.risk_details_helper.log.level",
	CHG_SUCCESS_PROBABILITY: "com.snc.change_management.success_probability",
	
	TABLES:{
		PROBABILITY_DETAILS: "sn_chg_probability_details",
		CHANGE_REQUEST: "change_request",
	},

	RISK_ASSESSMENT: "risk_assessment",
	RISK_CONDITION: "risk_condition",
	LEGACY_RISK_ASSESSMENT: "legacy_risk_assessment",
	RISK_ML: "risk_ml",
	RISK_SCORE: "calculated_risk_score",

	SYS_PROPERTIES:{
		SHOW_CALCULATED_RISK_SCORE: "change.risk.show_calculated_risk_score",
	},

	initialize: function() {
		this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();
	},

	canRead: function(changeSysId) {
		var gr = new GlideRecordSecure("change_request");
		if (!gr.get(changeSysId))
			return false;

		return this._canRead(gr);
	},

	showDetailsButton: function(changeGr) {
		if (changeGr.isNewRecord() || this.getViewDetailsEnabled() !== "enable")
			return false;

		var changeSysId = changeGr.getUniqueValue();
		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[showDetailsButton] changeSysId: " + changeSysId);

		var changeRiskDetailsGr = this._getChangeRiskDetails(changeSysId);

		// If it has a record, then a Risk Calculation was run
		return changeRiskDetailsGr.hasNext();
	},

	showDetailsLink: function(riskAsmtMatched) {
		var actionDefined = false;
		try {
			// typeof action when defined throws: org.mozilla.javascript.EvaluatorException: Invalid JavaScript value of type
			typeof action;
		} catch(error) {
			actionDefined = true;
		}

		if (!this.isServicePortal() && this.getViewDetailsEnabled() === "enable") {
			var calcRule = gs.getProperty('glide.ui.risk_calculate_rule');
			if (calcRule === 'ui_action'
				|| calcRule === 'business_rule' && actionDefined && JSUtil.notNil(action.getRedirectURL())
				|| calcRule === 'business_rule' && riskAsmtMatched)
				return true;
			else
				return false;
		}
		return false;
	},

	applyRiskValue: function() {
		if (!GlidePluginManager.isActive("com.snc.change_management.ml.risk"))
			return false;

		return new sn_chg_ml_risk.ChangeMLRiskCalculator().applyRiskValue();
	},

	isSolutionEnabled: function() {
		if (!GlidePluginManager.isActive("com.snc.change_management.ml.risk"))
			return false;

		return new sn_chg_ml_risk.ChangeMLRiskCalculator().isSolutionEnabled();
	},

	_initChangeRiskDetails: function(changeSysId) {

		var changeRiskDetailsGr = this._getChangeRiskDetails(changeSysId);
		if (!changeRiskDetailsGr.next())
			return {};

		var changeRiskDetails = this.toJS(changeRiskDetailsGr);

		// Avoid adding ACLs to risk_conditions table, so bypass to get risk condition name and sys_id
		if (!changeRiskDetails.risk_condition) {
			var riskConditionGr = changeRiskDetailsGr.risk_condition.getRefRecord();
			changeRiskDetails.risk_condition = {
				display_value: riskConditionGr.getDisplayValue(),
				value: riskConditionGr.getUniqueValue()
			};
		}

		if (changeRiskDetails.change_request) {
			var changeRequestGr = changeRiskDetailsGr.change_request.getRefRecord();
			changeRiskDetails.change_request.risk = {
				value: changeRequestGr.getValue("risk"),
				display_value: changeRequestGr.getDisplayValue("risk")
			};
		}

		changeRiskDetails.mlOptions = {
			isReadOnly: !this.applyRiskValue(),
			isEnabled: this.isSolutionEnabled() + "" === "true"
		};

		return changeRiskDetails;
	},

	getChangeRiskDetails: function(changeSysId) {

		if (!changeSysId)
			return {};

		var changeRiskDetails = this._initChangeRiskDetails(changeSysId);
		if (!changeRiskDetails.change_request)
			return {};

		changeRiskDetails.highestRisk = this.getHighestRisk(changeSysId, changeRiskDetails);

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[getChangeRiskDetails] changeRiskDetails: " + JSON.stringify(changeRiskDetails));

		return changeRiskDetails;
	},

	getHighestRisk: function(changeSysId, changeRiskDetails) {

		var highestRiskObject = {
			field: "other",
			label: "Other",
			value: "",
			display_value: ""
		};

		if (!changeSysId)
			return highestRiskObject;

		changeRiskDetails = changeRiskDetails || this._initChangeRiskDetails(changeSysId);

		if (!changeRiskDetails)
			return highestRiskObject;

		var highestRiskValue = null;
		var highestRiskField = "";

		// Highest risk wins (actually lowest value, High=2, Moderate=3, Low=4)
		if (this._isValidField(changeRiskDetails, this.RISK_SCORE, "calculated_risk_score_risk")) {
			var riskCalculatedScoreValue = parseInt(changeRiskDetails.calculated_risk_score_risk.value);
			if (!isNaN(riskCalculatedScoreValue) && (highestRiskValue === null || highestRiskValue >= riskCalculatedScoreValue)){
				highestRiskValue = riskCalculatedScoreValue;
				highestRiskField = this.RISK_SCORE;
			}
		}

		if (changeRiskDetails.risk_ml_set && changeRiskDetails.risk_ml_set.value === true && this._isValidField(changeRiskDetails, this.RISK_ML)) {
			var riskMlValue = parseInt(changeRiskDetails.risk_ml.value);
			if (!isNaN(riskMlValue) && (highestRiskValue === null || highestRiskValue >= riskMlValue)){
				highestRiskValue = riskMlValue;
				highestRiskField = this.RISK_ML;
			}
		}

		if (GlidePluginManager.isActive("com.snc.change.risk_assessment") &&
			!GlidePluginManager.isActive("com.snc.change_management.risk_assessment") &&
			this._showLegacyRiskAssessment(changeRiskDetails)) {
				var riskLegacyAssessmentValue = parseInt(changeRiskDetails.legacy_risk_assessment.value);
				if (!isNaN(riskLegacyAssessmentValue) && (highestRiskValue === null || highestRiskValue >= riskLegacyAssessmentValue)) {
					highestRiskValue = riskLegacyAssessmentValue;
					highestRiskField = this.LEGACY_RISK_ASSESSMENT;
				}
		}

		if (GlidePluginManager.isActive("com.snc.change_management.risk_assessment") && this._isValidField(changeRiskDetails, this.RISK_ASSESSMENT)) {
			var riskAssessmentValue = parseInt(changeRiskDetails.risk_assessment.value);
			if (!isNaN(riskAssessmentValue) && (highestRiskValue === null || highestRiskValue >= riskAssessmentValue)) {
				highestRiskValue = riskAssessmentValue;
				highestRiskField = this.RISK_ASSESSMENT;
			}
		}

		if (this._isValidField(changeRiskDetails, this.RISK_CONDITION, "risk_condition_risk")) {
			var riskConditionValue = parseInt(changeRiskDetails.risk_condition_risk.value);
			if (!isNaN(riskConditionValue) && (highestRiskValue === null || highestRiskValue >= riskConditionValue)){
				highestRiskValue = riskConditionValue;
				highestRiskField = this.RISK_CONDITION;
			}
		}

		var changeRequestRiskValue = parseInt(changeRiskDetails.change_request.risk.value);

		if (!isNaN(changeRequestRiskValue) && !isNaN(highestRiskValue) && (changeRequestRiskValue === highestRiskValue)) {

			switch(highestRiskField) {
				case this.RISK_CONDITION:
					highestRiskObject = this._getRisk("risk_condition_risk", gs.getMessage("Risk Conditional Rule"), changeRiskDetails);
					break;
				case this.LEGACY_RISK_ASSESSMENT:
					highestRiskObject = this._getRisk(this.LEGACY_RISK_ASSESSMENT, gs.getMessage("Legacy Risk Assessment"), changeRiskDetails);
					break;
				case this.RISK_ASSESSMENT:
					highestRiskObject = this._getRisk(this.RISK_ASSESSMENT, gs.getMessage("Risk Assessment"), changeRiskDetails);
					break;
				case this.RISK_ML:
					highestRiskObject = this._getRisk(this.RISK_ML, gs.getMessage("Risk Intelligence"), changeRiskDetails);
					break;
				case this.RISK_SCORE:
					highestRiskObject = this._getRisk("calculated_risk_score_risk", gs.getMessage("Calculated Risk Score"), changeRiskDetails);
					break;
			}
		}

		return highestRiskObject;
	},

	_getRisk: function(fieldName, riskLabel, changeRiskDetails) {

		return {
			value: changeRiskDetails[fieldName].value,
			display_value: changeRiskDetails[fieldName].display_value,
			field: fieldName,
			label: riskLabel
		};
	},

	_isValidField: function(changeRiskDetails, fieldName, riskName) {

		if(!changeRiskDetails)
			return false;

		if (!fieldName)
			return false;

		riskName = riskName || fieldName;

		var hasRun = changeRiskDetails[fieldName + "_has_run"] && changeRiskDetails[fieldName + "_has_run"].value;
		var hasValue = changeRiskDetails[riskName] && changeRiskDetails[riskName].value;

		return hasRun && hasValue;
	},

	_showLegacyRiskAssessment: function(changeRiskDetails) {

		var showLegacyRiskAssessment = this.getShowLegacyRiskAssessment();
		switch(showLegacyRiskAssessment) {
			case "always":
				return true;
			case "never":
				return false;
			case "match":
				return this._isValidField(changeRiskDetails, this.LEGACY_RISK_ASSESSMENT);
		}
	},

	getChangeProbabilityDetails: function(changeSysId){
		var changeProbabilityDetailsGr = this._getChangeProbabilityDetails(changeSysId);
		if (!changeProbabilityDetailsGr || !changeProbabilityDetailsGr.next())
			return {};

		var changeProbabilityDetails = this.toJS(changeProbabilityDetailsGr);
		
		if (changeProbabilityDetails.probability_module){
			var probabilitySuccessGr = changeProbabilityDetailsGr.probability_module.getRefRecord();
			changeProbabilityDetails.probabilityType = probabilitySuccessGr.getDisplayValue("probability");
		}
		
		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[getChangeProbabilityDetails] changeProbabilityDetails: " + JSON.stringify(changeProbabilityDetails));

		return changeProbabilityDetails;
	},

	isServicePortal: function() {
		try {
			return (gs.action.getGlideURI() + "").indexOf("api/now/sp") !== -1;
		} catch (error) {
			return false;
		}
	},

	getViewDetailsEnabled: function() {
		return gs.getProperty("change.risk.enable_view_details", "enable");
	},

	getShowRiskCondition: function() {
		return gs.getProperty("change.risk.show_risk_condition", "never");
	},

	getShowRiskAssessment: function() {
		return gs.getProperty("change.risk.show_risk_assessment", "never");
	},

	getShowLegacyRiskAssessment: function() {
		return gs.getProperty("change.risk.show_legacy_risk_assessment", "never");
	},

	getShowRiskIntelligence: function() {
		return gs.getProperty("change.risk.show_risk_intelligence", "never");
	},
	
	getShowCalculatedRiskScore: function() {
		return gs.getProperty(this.SYS_PROPERTIES.SHOW_CALCULATED_RISK_SCORE, "never");
	},

	_canRead: function(chgGr) {
		return chgGr.risk.canRead();
	},

	_getChangeRiskDetails: function(changeSysId) {
		if (!changeSysId)
			return;

		var changeRequestGr = new GlideRecordSecure("change_request");
		if (!changeRequestGr.get(changeSysId) || !this._canRead(changeRequestGr))
			return;

		var changeRiskDetailsGr = new GlideRecord("change_risk_details");
		changeRiskDetailsGr.addQuery("change_request", changeRequestGr.getUniqueValue());
		changeRiskDetailsGr.query();

		return changeRiskDetailsGr;
	},
	
	_getChangeProbabilityDetails: function(changeSysId){
		if (!changeSysId || !GlidePluginManager.isActive(this.CHG_SUCCESS_PROBABILITY))
			return;

		var changeRequestGr = new GlideRecordSecure(this.TABLES.CHANGE_REQUEST);
		if (!changeRequestGr.get(changeSysId) || !this._canRead(changeRequestGr))
			return;

		var changeProbabilityDetailsGr = new GlideRecord(this.TABLES.PROBABILITY_DETAILS);
		changeProbabilityDetailsGr.addQuery("change_request", changeRequestGr.getUniqueValue());
		changeProbabilityDetailsGr.query();

		return changeProbabilityDetailsGr;
	},

	toJS: function(gr) {
		return ChangeCommon.toJS(gr);
	},

	type: ChangeRiskDetailsHelperSNC
};
