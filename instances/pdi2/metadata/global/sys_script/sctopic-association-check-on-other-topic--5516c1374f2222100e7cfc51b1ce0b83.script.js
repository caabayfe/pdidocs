(function executeRule(current, previous /*null when async*/ ) {
    if (current.isNewRecord())
        return;

    var constants = StreamConnectTopicValidator;
    var ruleConstants = StreamConnectValidationService;
    var validator = new StreamConnectValidationService();
    var scTopicId = current.getUniqueValue();

    var rules = [{
        name: ruleConstants.RULE_TOPIC_ASSOCIATIONS,
        params: {
            fieldValue: scTopicId,
            fieldName: constants.SC_TOPIC_FIELD,
            tableNames: [
                constants.HERMES_TOPIC_TABLE,
                constants.EXTERNAL_TOPIC_TABLE
            ],
        },
        message: gs.getMessage('This Topic Alias is not connected to any kafka topic.')
    }];

    validator.validate(current, rules);
})(current, previous);
