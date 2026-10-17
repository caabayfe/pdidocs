/**
 @Param ciSysId - Sysid of CI
 @Param metricId - SysId of metric type
 @Param resourceId - SysId of resource
 @Param anomalyTime - anomaly timestamp
 @Param anomalyInfo - JSON String od anomaly info object.
 Eample:"{
 "anomalyScore":3.6091108322143555,
 "zscore":-0.5254925489425659,
 "controlFactor":5.0,
 "modelType":"POSITIVE_NOISY",
 "modelOriginTime":1643978400000,
 "modelHorizonTime":1649248200000,
 "lowerControlBound":0.0,
 "upperControlBound":216.55084228515625,
 "metricValue":34.443336486816406,
 "anomalyTime":0,
 "lastAnomalyScore":0.0,
 "lastAnomalyTime":0
 }"
*/
(function runExternalAnomalyDetection(ciSysId, metricId, resourceId, anomalyTime, anomalyInfo){
    var isUseExternalAnomalyDetection = GlideProperties.getBoolean("sn_metric_pred.use_external_anomaly_detection", false);
	var isUseExternalDetectionOnTopOfNative = GlideProperties.getBoolean("sn_metric_pred.use_external_detection_on_top_of_native", false);
	var minAnomalyScoreForExternalDetection = GlideProperties.getInt("sn_metric_pred.min_anomaly_score_for_external_detection", 5);


	var anomalyInfoJSON = JSON.parse(anomalyInfo);
	//Check if the "Predictive Metric Intelligence" app is installed.	
	if (!GlidePluginManager.isActive("sn_metric_pred")){
		gs.debug("EvtMgmtCustom_AnomalyDetectionPostProcessorEngineHandler. The Predictive Metric Intelligence scoped app is not active. Skip running external anomaly detection.");
		return;
	}
	
	//Check if the external anomaly detection is allowed
	if(!isUseExternalAnomalyDetection || !isUseExternalDetectionOnTopOfNative){
		gs.debug("EvtMgmtCustom_AnomalyDetectionPostProcessorEngineHandler. External anomaly detection is not allowed. Skip running external anomaly detection.");
		return;
	}


	//Check if the anomaly score is more than defined in property.
	var anomalyScore = anomalyInfoJSON["anomalyScore"];
	if(anomalyScore < minAnomalyScoreForExternalDetection){
		gs.debug("EvtMgmtCustom_AnomalyDetectionPostProcessorEngineHandler. The metric anomaly score {0} is less than minimal score for external detection {1}. Skip running external anomaly detection.", [anomalyScore, minAnomalyScoreForExternalDetection]);
		return;
	}

	//check if the CI is in the CI For Prediction table. Insert new record if CI exists.
	var ciForPredictionGr = new GlideRecord("mi_ci_for_prediction");
	ciForPredictionGr.addQuery("cmdb_ci", ciSysId);
	ciForPredictionGr.addQuery("active", true);
	ciForPredictionGr.addQuery("ready_for_prediction", true);
	ciForPredictionGr.query();
	if(!ciForPredictionGr.hasNext()){
		gs.debug("EvtMgmtCustom_AnomalyDetectionPostProcessorEngineHandler. The CI {0} doesn't exist in CI For Prediction table. Skip running external detection.", [ciSysId]);
		return;
	}
	
	//insert new record to Anomalies Queue For Prediction table
	var anomaliesQueueForPredictionGr = new GlideRecord("mi_anomalies_queue_for_prediction");
	anomaliesQueueForPredictionGr.initialize();
	anomaliesQueueForPredictionGr.setValue("cmdb_ci", ciSysId);
	anomaliesQueueForPredictionGr.setValue("metric_type", metricId);
	anomaliesQueueForPredictionGr.setValue("resource_id", resourceId);
	anomaliesQueueForPredictionGr.setValue("anomaly_score", anomalyScore);
	anomaliesQueueForPredictionGr.setValue("anomaly_time", anomalyTime);
	anomaliesQueueForPredictionGr.setValue("state", "new");
	anomaliesQueueForPredictionGr.insert();
	gs.info("EvtMgmtCustom_AnomalyDetectionPostProcessorEngineHandler. The CI {0} with anomaly score {1}, added to the anomalies queue for external prediction.", [ciSysId, anomalyScore]);
	
 })(ciSysId, metricId, resourceId, anomalyTime, anomalyInfo);
