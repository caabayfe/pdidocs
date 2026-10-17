(function executeRule(current, previous /*null when async*/ ) {
    current.condition = new STTRMCondition(current).getMandatoryFieldsEncQuery();
})(current, previous);
