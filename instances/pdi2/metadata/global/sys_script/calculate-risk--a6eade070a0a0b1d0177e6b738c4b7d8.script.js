// This Business Rule only supports Risk Conditions. If Change Management - Risk Assessment [com.snc.change_management.risk_assessment] plugin is installed it will be deactivated.
// This business rule checks Risk Conditions and returns evalutatedRiskImpact object which has:
// risk.value and risk.display_value as well as impact.value and impact.display_value and riskCondition
// For validation with a form button, deactivate this business rule and activate the Calculate Risk UI Action
var riskCalculator = new RiskCalculator(current);
var rpDefined = false;
try {
	// typeof RP when defined throws: org.mozilla.javascript.EvaluatorException: Invalid JavaScript value of type com.glide.ui.RenderProperties 
	typeof RP;
} catch(error) {
	rpDefined = true;
}

// hide notification for WEP workspaces that have no RP
if (!rpDefined && riskCalculator.setHideNotification)
	riskCalculator.setHideNotification(true);

var evaluatedRiskImpact = riskCalculator.setDryRun(true).evaluateRiskImpact();
if (!evaluatedRiskImpact.errorMsg) {
	riskCalculator.setRiskImpact(evaluatedRiskImpact, current);
	riskCalculator.updateChangeRiskDetails();
} else if (rpDefined)
	gs.addInfoMessage(evaluatedRiskImpact.errorMsg);
