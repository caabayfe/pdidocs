(function executeRule(current, previous /*null when async*/) {
	var predictor = new MLPredictor();
	predictor.recordFinalValuesInPredictionResults(current, "On close");

})(current, previous);
