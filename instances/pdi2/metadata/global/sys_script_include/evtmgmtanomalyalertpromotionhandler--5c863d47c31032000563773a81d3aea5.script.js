var EvtMgmtAnomalyAlertPromotionHandler = Class.create();
EvtMgmtAnomalyAlertPromotionHandler.prototype = {
    initialize: function() {
    },
    type: 'EvtMgmtAnomalyAlertPromotionHandler'
};
EvtMgmtAnomalyAlertPromotionHandler.createPromotionRule = function(anomalyAlert) {
	var mutex = new GlideSelfCleaningMutex('alert_anomaly' + anomalyAlert.sys_id, 'EvtMgmtAnomalyAlertPromotionHandler');
	mutex.get();
	var promotionRule;
	try {
		var anomalyAlertGr = new GlideRecord("em_alert_anomaly");
		anomalyAlertGr.get(anomalyAlert.sys_id);
		if (!anomalyAlertGr.it_alert.nil()) {
			gs.log("Promotion rule exists");
			return false; // Don't create promotion rule if already has one
		}
		var alertManager = new SNC.AlertManager();
		var ciType = '';
		var ci = '';
		if (!anomalyAlertGr.cmdb_ci.nil()){
			ci = anomalyAlertGr.cmdb_ci;
			ciType = alertManager.getCiType(anomalyAlertGr.cmdb_ci);
			gs.log("CI type " + ciType);
		}
		var additionalParams = EvtMgmtAnomalyAlertPromotionHandler.getAdditionalParams(anomalyAlertGr.additional_info);
		gs.log("Additional params " + additionalParams);
		promotionRule = EvtMgmtAnomalyAlertPromotionHandler.findEmptyRule();
		if (promotionRule == null) {
			promotionRule = EvtMgmtAnomalyAlertPromotionHandler.createRule(anomalyAlertGr.source, additionalParams[0], anomalyAlertGr.cmdb_ci, ciType, additionalParams[1], anomalyAlertGr.sys_id, additionalParams[2]);
			gs.log("Empty rule was not found");
		}
		else{
			promotionRule = EvtMgmtAnomalyAlertPromotionHandler.updateRule(promotionRule, anomalyAlertGr.source, additionalParams[0], anomalyAlertGr.cmdb_ci, ciType, additionalParams[1], anomalyAlertGr.sys_id, additionalParams[2]);
			gs.log("Empty rule was found " + promotionRule.sys_id);
		}
		anomalyAlertGr.setValue("promotion_rule", promotionRule.sys_id);
		anomalyAlertGr.update();
	} finally {
		mutex.release();
	}
	return promotionRule;
};
EvtMgmtAnomalyAlertPromotionHandler.findEmptyRule = function() {
	var alertRule = new GlideRecord("em_alert_promotion_rule");
	alertRule.addNullQuery("type");
	alertRule.query();
	if (alertRule.next())
		return alertRule;
	return null;
};
EvtMgmtAnomalyAlertPromotionHandler.createRule = function(source, metricName, ci, ciType, promotionParameter, alertSysId, anomalyScore){
	var alertRule = new GlideRecord('em_alert_promotion_rule');
	EvtMgmtAnomalyAlertPromotionHandler.setRuleValues(alertRule, source, metricName, ci, ciType, promotionParameter, alertSysId, anomalyScore);
	alertRule.insert();
	return alertRule;
};
EvtMgmtAnomalyAlertPromotionHandler.updateRule = function(alertRule, source, metricName, ci, ciType, promotionParameter, alertSysId, anomalyScore){
	EvtMgmtAnomalyAlertPromotionHandler.setRuleValues(alertRule, source, metricName, ci, ciType, promotionParameter, alertSysId, anomalyScore);
	alertRule.update();
	return alertRule;
};
EvtMgmtAnomalyAlertPromotionHandler.setRuleValues = function(alertRule, source, metricName, ci, ciType, promotionParameter, alertSysId, anomalyScore){
	alertRule.setValue("name", "");
	alertRule.setValue("source", source);
	alertRule.setValue("cmdb_ci", ci);
	alertRule.setValue("ci_type", ciType);
	alertRule.setValue("metric_name", metricName);
	alertRule.setValue("promotion_parameter", promotionParameter);
	alertRule.setValue("alert", alertSysId);
	alertRule.setValue("anomaly_score", anomalyScore);
};
EvtMgmtAnomalyAlertPromotionHandler.getAdditionalParams = function(additionalInfo){
	var additionalParams = [];
	additionalParams[0] = '';
	additionalParams[1] = '';
	additionalParams[2] = '';
	
	if (additionalInfo == null || additionalInfo == '')
		return additionalParams;
	
	var additionalInfoJSON;
	try {
	 additionalInfoJSON = JSON.parse(additionalInfo);
	}
	catch (e){
		gs.logError("Failed to parse additional info JSON: "+ additionalInfo, e);
		return additionalParams;
	}
	
	if (additionalInfoJSON == null || additionalInfoJSON.length == 0){
		return additionalParams;
	}
	additionalParams[0] = additionalInfoJSON.source_metric_type == null ? '': additionalInfoJSON.source_metric_type;
	additionalParams[1] = additionalInfoJSON.promotion_parameter == null ? '': additionalInfoJSON.promotion_parameter;
	additionalParams[2] = additionalInfoJSON.anomaly_score == null ? '': additionalInfoJSON.anomaly_score;

	return additionalParams;
};
