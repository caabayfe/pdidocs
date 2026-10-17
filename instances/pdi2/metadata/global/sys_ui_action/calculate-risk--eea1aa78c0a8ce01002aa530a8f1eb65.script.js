var riskCalculator = new global.RiskCalculator(current);
var evaluatedRiskImpact = riskCalculator.evaluateRiskImpact();
if (evaluatedRiskImpact && evaluatedRiskImpact.errorMsg)
	gs.addInfoMessage(evaluatedRiskImpact.errorMsg);
action.setRedirectURL(current);
