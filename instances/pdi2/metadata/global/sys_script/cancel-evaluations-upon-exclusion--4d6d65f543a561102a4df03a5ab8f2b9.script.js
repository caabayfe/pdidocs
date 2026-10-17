(function executeRule(current, previous /*null when async*/) {

	new sn_eval.EvaluationService().cancelEvaluationsForArtifact(current.getUniqueValue());

})(current, previous);
