(function executeRule(current, previous /*null when async*/ ) {
    current.condition = new STTRMConditionType(current).getMandatoryFieldsEncQuery();
})(current, previous);
