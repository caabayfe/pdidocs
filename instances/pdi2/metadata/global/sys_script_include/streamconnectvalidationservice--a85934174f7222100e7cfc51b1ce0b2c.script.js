var StreamConnectValidationService = Class.create();

//Define rule constants
StreamConnectValidationService.RULE_TOPIC_ASSOCIATIONS = 'topicAssociations';
StreamConnectValidationService.RULE_FIELD_UNIQUENESS = 'fieldValueUniqueness';
StreamConnectValidationService.RULE_ACTIVE_CONNECTION_COUNT = 'activeConnectionCount';
StreamConnectValidationService.RULE_CONNECTION_MID_USAGE = 'connectionMidUsage';
StreamConnectValidationService.RULE_CONNECTION_MID_USAGE_CHANGE = 'connectionMidUsageChange';

StreamConnectValidationService.prototype = {
  initialize: function() {
    this.topicValidator = new StreamConnectTopicValidator();
    this.connectionValidator = new StreamConnectConnectionConfigValidator();

    this.validationMap = {};

    //Map rule names to validators and their methods
    this.validationMap[StreamConnectValidationService.RULE_TOPIC_ASSOCIATIONS] = {
      validator: this.topicValidator,
      method: 'validateTopicAssociations'
    };
    this.validationMap[StreamConnectValidationService.RULE_FIELD_UNIQUENESS] = {
      validator: this.topicValidator,
      method: 'validateFieldValueUniqueness'
    };
    this.validationMap[StreamConnectValidationService.RULE_ACTIVE_CONNECTION_COUNT] = {
      validator: this.connectionValidator,
      method: 'validateActiveConnectionCount'
    };
    this.validationMap[StreamConnectValidationService.RULE_CONNECTION_MID_USAGE] = {
      validator: this.connectionValidator,
      method: 'validateConnectionMidUsage'
    };
    this.validationMap[StreamConnectValidationService.RULE_CONNECTION_MID_USAGE_CHANGE] = {
      validator: this.connectionValidator,
      method: 'validateConnectionMidUsageChange'
    };
  },

  /**
 * Main validate method to process rules
 * @param {GlideRecord} current - The current record being processed
 * @param {Array} rules - Array of rule objects to validate
 */
  validate: function(current, rules) {
    if (!current || !rules || !Array.isArray(rules) || rules.length === 0) {
      gs.warn(
          'StreamConnectValidationService Invalid parameters: current=' +
          current + ', rules=' + JSON.stringify(rules));
      return;
    }

    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      this._validateRule(current, rule);
    }
  },

  /**
 * Validate a specific rule by delegating to the appropriate validator
 * @param {GlideRecord} current - The current record
 * @param {Object} rule - The rule to validate
 * @returns {Boolean} Whether the record passes validation
 */
  _validateRule: function(current, rule) {
    var ruleName = rule.name;
    var validationInfo = this.validationMap[ruleName];

    if (validationInfo) {
      return validationInfo.validator[validationInfo.method](current, rule);
    }

    gs.warn('Unknown validation rule: ' + ruleName, 'StreamConnectValidationService');
    return true;
  },

  type: 'StreamConnectValidationService'
};
