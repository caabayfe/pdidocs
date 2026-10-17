(function executeRule(current, previous /*null when async*/ ) {
    var conditionTypeGr = current.sttrm_condition_type.getRefRecord();
    conditionTypeGr.condition = new STTRMConditionType(conditionTypeGr).getMandatoryFieldsEncQuery();
    conditionTypeGr.update();
})(current, previous);
