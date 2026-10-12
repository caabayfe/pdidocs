(function executeRule(current, previous /*null when async*/ ) {
    var transitionConditionGr = current.transition_condition.getRefRecord();
    transitionConditionGr.condition = new STTRMCondition(transitionConditionGr).getMandatoryFieldsEncQuery();
    transitionConditionGr.update();
})(current, previous);
