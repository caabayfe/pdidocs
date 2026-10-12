var OneExtendValidator = Class.create();
OneExtendValidator.prototype = {
    LOGGER: new sn_log.GlideLogger('global.OneExtendValidator', ['definitionId']),
    initialize: function() {},

    executeRequestValidator: function(definitionId, inputs) {
        this.LOGGER.debug("Executing request validator for definition : " + definitionId + " with inputs : " + inputs);
        if (!this._canExecute(definitionId))
            return inputs;

        var validatorGr = this._getRequestValidators(definitionId);
        while (validatorGr.next()) {
            inputs = this._validate(inputs, validatorGr);
        }

        if (typeof inputs == 'string')
            inputs = JSON.parse(inputs);
        return inputs;
    },

    executeResponseValidator: function(definitionId, outputs) {
        this.LOGGER.debug("Executing response validator for definition : " + definitionId + " with outputs : " + outputs);
        if (!this._canExecute(definitionId))
            return outputs;

        var validatorGr = this._getResponseValidators(definitionId);
        while (validatorGr.next()) {
            outputs = this._validate(outputs, validatorGr);
        }

        if (typeof outputs == 'string')
            outputs = JSON.parse(outputs);
        return outputs;
    },

    _getRequestValidators: function(definitionId) {
        var validatorGr = new GlideRecord("sys_generative_ai_request_validator");
        validatorGr.orderBy("order");
        validatorGr.addQuery("active", true);
        validatorGr.addQuery("document_table", "sys_one_extend_capability_definition");
        validatorGr.addQuery("validator.active", true);
        var qc = validatorGr.addQuery('definition', definitionId);
        qc.addOrCondition('document_id', definitionId);
        validatorGr.query();
        return validatorGr;
    },

    _getResponseValidators: function(definitionId) {
        var validatorGr = new GlideRecord("sys_generative_ai_response_validator");
        validatorGr.orderBy("order");
        validatorGr.addQuery("active", true);
        validatorGr.addQuery("definition_table", "sys_one_extend_capability_definition");
        validatorGr.addQuery("definition", definitionId);
        validatorGr.addQuery("validator.active", true);
        validatorGr.query();
        return validatorGr;
    },

    _validate: function(payload, validatorGr) {
        var validator = new GlideRecord("sys_generative_ai_validator");
        validator.get(validatorGr.validator);
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable("payload", payload);
        var validatedResponse = evaluator.evaluateScript(validator, 'validator_script', null);
        return validatedResponse;
    },

    _canExecute: function(definitionId) {
        if (definitionId == null)
            return false;

        var definitionGr = new GlideRecord("sys_one_extend_capability_definition");
        if (!definitionGr.get(definitionId))
            return false;

        var capabilityGr = new GlideRecord("sys_one_extend_capability");
        if (!capabilityGr.get(definitionGr.getValue("capability")))
            return false;
        return true;
    },

    type: 'OneExtendValidator'
};
