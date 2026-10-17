var DecisionInputRepository = Class.create();

DecisionInputRepository.SN_DECISION_TABLE_DECISION_INPUT = "sys_decision_input";
DecisionInputRepository.SUCCESS = "Success";
DecisionInputRepository.FAIL = "Failure";
DecisionInputRepository.requiredDecisionInputFields = [
    "internal_type", "label", "element"
];
DecisionInputRepository.ERROR_CODES = {
    INPUT_CREATE_FAILED: 'INPUT_CREATE_FAILED',
    INPUT_UPDATE_FAILED: 'INPUT_UPDATE_FAILED',
    INPUT_DELETE_FAILED: 'INPUT_DELETE_FAILED',
};

DecisionInputRepository.prototype = {
    initialize: function() {},
    /**
     * Returns list of input records for a decision table
     * @param decisionTableSysId
     * @returns {GlideRecord}
     */
    getDecisionInputsByDecisionTable: function(decisionTableSysId, delta) {
        // using GlideRecord because we already have a access check in the resolver and avoid display value issues for delegated developer
        var decisionInputGr = new GlideRecord(DecisionInputRepository.SN_DECISION_TABLE_DECISION_INPUT);
        var query = decisionInputGr.addQuery("model", decisionTableSysId);
        if (delta && delta.trim() != '')
            query.addOrCondition("model", delta);

        decisionInputGr.orderBy("order");
        decisionInputGr.query();

        return decisionInputGr;
    },

    /**
     * Creates decision input with given details
     * @param decisionInput
     * @returns {Object}
     */
    createDecisionInput: function(decisionInput) {
        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionInput, DecisionInputRepository.requiredDecisionInputFields);
        if (validation.status === DecisionInputRepository.FAIL) {
            return {
                status: DecisionInputRepository.FAIL,
                errorCode: DecisionInputRepository.ERROR_CODES.INPUT_CREATE_FAILED,
                errorMessage: validation.message
            };
        }

        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.createInput(decisionInput);
        if (response.status === DecisionInputRepository.FAIL) {
            return {
                status: DecisionInputRepository.FAIL,
                errorCode: DecisionInputRepository.ERROR_CODES.INPUT_CREATE_FAILED,
                errorMessage: 'Creation of decision input was not successful'
            };
        }

        var inputGR = response.record;
        return this._getDecisionInputDetails(inputGR);
    },

    /**
     * Updates decision input with given sys_id and details
     * @param sysId
     * @param decisionInput
     * @returns {Object}
     */
    updateDecisionInput: function(sysId, decisionInput) {
        if (!sysId && !sysId.trim()) {
            return {
                status: DecisionInputRepository.FAIL,
                errorCode: DecisionInputRepository.ERROR_CODES.INPUT_UPDATE_FAILED,
                errorMessage: 'Invalid sysId'
            };
        }
        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionInput, DecisionInputRepository.requiredDecisionInputFields);
        if (validation.status === DecisionInputRepository.FAIL) {
            return {
                status: DecisionInputRepository.FAIL,
                errorCode: DecisionInputRepository.ERROR_CODES.INPUT_UPDATE_FAILED,
                errorMessage: validation.message
            };
        }

        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.updateInput(sysId, decisionInput);
        if (response.status === DecisionInputRepository.FAIL) {
            return {
                status: DecisionInputRepository.FAIL,
                errorCode: DecisionInputRepository.ERROR_CODES.INPUT_UPDATE_FAILED,
                errorMessage: 'Update of decision input was not successful'
            };
        }
        var inputGR = response.record;
        return this._getDecisionInputDetails(inputGR);
    },

    /**
     * Deletes decision input with given sys_id
     * @param decisionInputSysId
     * @returns {Object}
     */
    deleteDecisionInput: function(decisionInputSysId) {
        var decisionInputGr = new GlideRecord(DecisionInputRepository.SN_DECISION_TABLE_DECISION_INPUT);
        const deleteResponse = {
            sys_id: decisionInputSysId,
        };
        decisionInputGr.get(decisionInputSysId);
        if (decisionInputGr.isValidRecord() === false) {
            deleteResponse.modified_count = 0;
        }
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.deleteInput(decisionInputSysId);

        if (response.status === DecisionInputRepository.FAIL) {
            return {
                status: DecisionInputRepository.FAIL,
                errorCode: DecisionInputRepository.ERROR_CODES.INPUT_DELETE_FAILED,
                errorMessage: 'Delete of decision input was not successful'
            };
        } else {
            deleteResponse.modified_count = 1;
        }

        return deleteResponse;
    },

    _getDecisionInputDetails: function(decisionInputRecord) {
        var inputDetails = {};

        inputDetails.sys_class_name = {
            value: decisionInputRecord.getValue('sys_class_name')
        };
        inputDetails.sys_id = {
            value: decisionInputRecord.getValue('sys_id')
        };
        inputDetails.internal_type = {
            value: decisionInputRecord.getValue('internal_type'),
            display_value: decisionInputRecord.internal_type.getDisplayValue()
        };
        inputDetails.model = {
            value: decisionInputRecord.getValue('model'),
            display_value: decisionInputRecord.model.getDisplayValue()
        };
        inputDetails.parent = {
            value: decisionInputRecord.getValue('parent'),
            display_value: decisionInputRecord.parent.getDisplayValue()
        };
        inputDetails.reference = {
            value: decisionInputRecord.getValue('reference'),
            display_value: decisionInputRecord.getDisplayValue('reference')
        };
        inputDetails.reference_qual_condition = {
            value: decisionInputRecord.getValue('reference_qual_condition'),
            display_value: decisionInputRecord.getDisplayValue('reference_qual_condition')
        };
        inputDetails.sys_scope = {
            value: decisionInputRecord.getValue('sys_scope'),
            display_value: decisionInputRecord.getDisplayValue('sys_scope')
        };
        inputDetails.element = {
            value: decisionInputRecord.getValue('element')
        };
        inputDetails.max_length = {
            value: decisionInputRecord.getValue('max_length'),
        };
        inputDetails.name = {
            value: decisionInputRecord.getValue('name')
        };
        inputDetails.label = {
            value: decisionInputRecord.getValue('label'),
        };
        inputDetails.active = {
            value: !!(parseInt(decisionInputRecord.getValue('active'), 10))
        };
        inputDetails.mandatory = {
            value: !!(parseInt(decisionInputRecord.getValue('mandatory'), 10))
        };
        inputDetails.order = {
            value: decisionInputRecord.getValue('order')
        };
        inputDetails.choice = {
            value: decisionInputRecord.getValue('choice'),
            display_value: decisionInputRecord.getDisplayValue('choice')
        };
        inputDetails.choice_table = {
            value: decisionInputRecord.getValue('choice_table'),
            displayValue: decisionInputRecord.getDisplayValue('choice_table')
        };
        inputDetails.choice_field = {
            value: decisionInputRecord.getValue('choice_field'),
            displayValue: decisionInputRecord.getDisplayValue('choice_field')
        };


        return inputDetails;
    },
    type: 'DecisionInputRepository'
};
