(function executeRule(current, previous /*null when async*/ ) {
    new SNC.SetAssessmentResults().storeQuestionResults(current.sys_id);
})(current, previous);
