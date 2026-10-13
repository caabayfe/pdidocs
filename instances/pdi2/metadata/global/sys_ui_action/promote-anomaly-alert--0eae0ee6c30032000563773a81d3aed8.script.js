gs.include('EvtMgmtAnomalyAlertPromotionHandler');
EvtMgmtAnomalyAlertPromotionHandler.createPromotionRule(current);
var gr = new GlideRecord('em_alert_anomaly');
gr.get(current.sys_id);
if (gr.promotion_rule.nil()) {
	gs.error("Failed to create promotion rule");
	var errorMsg= gs.getMessage("Failed to create promotion rule");
	gs.addErrorMessage(errorMsg);
}
else {
	   action.setRedirectURL('em_alert_promotion_rule.do?sys_id=' + gr.promotion_rule);
}
