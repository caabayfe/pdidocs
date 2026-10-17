(function executeRule(current, previous /*null when async*/ ) {
    var constants = StreamConnectTopicValidator;
    var ruleConstants = StreamConnectValidationService;
    var validator = new StreamConnectValidationService();

    var scTopicId = current.getValue(constants.SC_TOPIC_FIELD);
    var hermesTopicId = current.getValue(constants.HERMES_TOPIC_FIELD);

    var rules = [];
    if (scTopicId) {
        // Check for uniqueness of sc topic within the same table
        rules.push({
            name: ruleConstants.RULE_FIELD_UNIQUENESS,
            params: {
                fieldValue: scTopicId,
                fieldName: constants.SC_TOPIC_FIELD,
                tableName: constants.HERMES_TOPIC_TABLE,
                excludeCurrent: true
            },
            message: gs.getMessage('A Topic Alias can be linked with only one kafka topic.')
        });

        // Check for conflicts with External table
        rules.push({
            name: ruleConstants.RULE_FIELD_UNIQUENESS,
            params: {
                fieldValue: scTopicId,
                fieldName: constants.SC_TOPIC_FIELD,
                tableName: constants.EXTERNAL_TOPIC_TABLE,
                excludeCurrent: false
            },
            message: gs.getMessage('A Topic Alias can be linked with only one kafka topic.')
        });
    }

    // Check for one-to-one Hermes Topic relationship
    if (hermesTopicId) {
        rules.push({
            name: ruleConstants.RULE_FIELD_UNIQUENESS,
            params: {
                fieldValue: hermesTopicId,
                fieldName: constants.HERMES_TOPIC_FIELD,
                tableName: constants.HERMES_TOPIC_TABLE,
                excludeCurrent: true
            },
            message: gs.getMessage('A Hermes topic can be linked with only one Topic Alias.')
        });
    }

    validator.validate(current, rules);
})(current, previous);
