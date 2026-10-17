window.NOW = window.NOW || {};
window.NOW.rtl = window.NOW.rtl || "$[jvar_text_direction]" || "ltr";
window.NOW.risk_details = window.NOW.risk_details || {};
window.NOW.chg_probability_details = {};
window.NOW.risk_details.has_rights = "$[jvar_has_rights]" == "true";

if (window.NOW.risk_details.has_rights === true) {
	window.NOW.risk_details.title = "$[gs.getMessage('Risk Details')]";
	window.NOW.risk_details.ml_review = "$[gs.getMessage('Risk Intelligence value has been set to \'view only\' and won\'t change this request\'s risk level')]";
	window.NOW.risk_details.pluginsInstalled = {
		"BestPractice": $[GlidePluginManager.isActive("com.snc.bestpractice.change_risk")] == true,
		"LegacyRiskAsmt": $[GlidePluginManager.isActive("com.snc.change.risk_assessment")] == true,
		"RiskAsmt": $[GlidePluginManager.isActive("com.snc.change_management.risk_assessment")] == true,
		"MlRisk": $[GlidePluginManager.isActive("com.snc.change_management.ml.risk")] == true,
		"SuccessProbability": $[GlidePluginManager.isActive("com.snc.change_management.success_probability")] == true
	};
	window.NOW.risk_details.show = {
		"BestPractice": "$[new global.ChangeRiskDetailsHelper().getShowRiskCondition()]",
		"LegacyRiskAsmt": "$[new global.ChangeRiskDetailsHelper().getShowLegacyRiskAssessment()]",
		"RiskAsmt": "$[new global.ChangeRiskDetailsHelper().getShowRiskAssessment()]",
		"MlRisk": "$[new global.ChangeRiskDetailsHelper().getShowRiskIntelligence()]",
		"CalculatedRiskScore": "$[new global.ChangeRiskDetailsHelper().getShowCalculatedRiskScore()]",
	};
	window.NOW.risk_details.data = JSON.parse('$[JS:jvar_risk_details]');
	window.NOW.chg_probability_details.data = JSON.parse('$[JS:jvar_change_probability_details]');
}
