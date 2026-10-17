var DecisionConditionRepository = Class.create();
DecisionConditionRepository.SUCCESS = "SUCCESS";
DecisionConditionRepository.FAIL = "FAIL";
DecisionConditionRepository.requiredDecisionConditionFields = [
    "decision_input", "decision_table", "default_operator", "type", "label"
];
DecisionConditionRepository.SN_DECISION_TABLE_DECISION_CONDITION = "sn_decision_table_decision_condition";
DecisionConditionRepository.ERROR_CODES = {
    CONDITION_DOES_NOT_EXIST: 'CONDITION_DOES_NOT_EXIST',
    CONDITION_CREATE_FAILED: 'CONDITION_CREATE_FAILED',
    CONDITION_UPDATE_DENIED: 'CONDITION_UPDATE_DENIED',
    CONDITION_UPDATE_FAILED: 'CONDITION_UPDATE_FAILED',
    CONDITION_DELETE_DENIED: 'CONDITION_DELETE_DENIED',
    CONDITION_DELETE_FAILED: 'CONDITION_DELETE_FAILED',
};

DecisionConditionRepository.prototype = {
    initialize: function() {},
    createDecisionCondition: function(decisionCondition) {
        var validation = this._validateDecisionConditionInput(decisionCondition);
        if (validation.status === DecisionConditionRepository.FAIL) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_CREATE_FAILED,
                errorMessage: validation.message
            };
        }

        var decisionConditionGr = new GlideRecord(DecisionConditionRepository.SN_DECISION_TABLE_DECISION_CONDITION);
        decisionConditionGr.initialize();

        decisionConditionGr.label = decisionCondition.label;
        decisionConditionGr.decision_input = decisionCondition.decision_input;
        decisionConditionGr.description = decisionCondition.description;
        decisionConditionGr.field = decisionCondition.field;
        decisionConditionGr.field_label = decisionCondition.field_label;
        decisionConditionGr.type = this._getTypeSysId(decisionCondition.type);
        decisionConditionGr.default_operator = decisionCondition.default_operator;
        decisionConditionGr.decision_table = decisionCondition.decision_table;
        decisionConditionGr.order = decisionCondition.order;
        decisionConditionGr.reference = this._getTableSysId(decisionCondition.reference);
        decisionConditionGr.field_parent_table = decisionCondition.field_parent_table;
        decisionConditionGr.parent = decisionCondition.parent;

        var sysId = decisionConditionGr.insert();

        if (!sysId) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_CREATE_FAILED,
                errorMessage: 'Creation of decision condition was not successful'
            };
        }

        //return decisionConditionGr;
        return this._getDecisionConditionDetails(decisionConditionGr);
    },
    updateDecisionCondition: function(sys_id, decisionCondition) {
        var validation = this._validateDecisionConditionInput(decisionCondition);
        if (validation.status === DecisionConditionRepository.FAIL) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_UPDATE_FAILED,
                errorMessage: validation.message
            };
        }

        var decisionConditionGr = new GlideRecord(DecisionConditionRepository.SN_DECISION_TABLE_DECISION_CONDITION);
        if (decisionConditionGr.canRead() === false) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_UPDATE_DENIED,
                errorMessage: 'Does not have access to update the condition'
            };
        }
        decisionConditionGr.get(sys_id);

        if (decisionConditionGr.isValidRecord() === false) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_DOES_NOT_EXIST,
                errorMessage: 'Condition does not exist with this id'
            };
        }

        if ("label" in decisionCondition) {
            decisionConditionGr.label = decisionCondition.label;
        }
        if ("decision_input" in decisionCondition) {
            decisionConditionGr.decision_input = decisionCondition.decision_input;
        }
        if ("description" in decisionCondition) {
            decisionConditionGr.description = decisionCondition.description;
        }
        if ("field" in decisionCondition) {
            decisionConditionGr.field = decisionCondition.field;
        }
        if ("field_label" in decisionCondition) {
            decisionConditionGr.field_label = decisionCondition.field_label;
        }
        if ("type" in decisionCondition) {
            decisionConditionGr.type = this._getTypeSysId(decisionCondition.type);
        }
        if ("default_operator" in decisionCondition) {
            decisionConditionGr.default_operator = decisionCondition.default_operator;
        }
        if ("decision_table" in decisionCondition) {
            decisionConditionGr.decision_table = decisionCondition.decision_table;
        }
        if ("order" in decisionCondition) {
            decisionConditionGr.order = decisionCondition.order;
        }
        if ("reference" in decisionCondition) {
            decisionConditionGr.reference = this._getTableSysId(decisionCondition.reference);
        }
        if ("field_parent_table" in decisionCondition) {
            decisionConditionGr.field_parent_table = decisionCondition.field_parent_table;
        }
        if ("parent" in decisionCondition) {
            decisionConditionGr.parent = decisionCondition.parent;
        }

        var sysId = decisionConditionGr.update();
        if (sysId) {
            //return decisionConditionGr;
            return this._getDecisionConditionDetails(decisionConditionGr);
        } else {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_UPDATE_FAILED,
                errorMessage: 'Update of decision condition was not successful'
            };
        }

    },
    deleteDecisionCondition: function(sysId) {
        var decisionConditionGr = new GlideRecord(DecisionConditionRepository.SN_DECISION_TABLE_DECISION_CONDITION);
        if (decisionConditionGr.canRead() === false) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_DELETE_DENIED,
                errorMessage: 'Does not have access to delete the condition'
            };
        }
        decisionConditionGr.get(sysId);
        if (decisionConditionGr.isValidRecord() === false) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_DOES_NOT_EXIST,
                errorMessage: 'Condition does not exist with this id'
            };
        }
        var recordDeleted = decisionConditionGr.deleteRecord();

        if (recordDeleted === false) {
            return {
                status: DecisionConditionRepository.FAIL,
                errorCode: DecisionConditionRepository.ERROR_CODES.CONDITION_DELETE_FAILED,
                errorMessage: 'Deletion of decision condition was not successful'
            };
        }

        return {
            status: DecisionConditionRepository.SUCCESS
        };
    },
    getDecisionConditionsByDecisionTable: function(decisionTableSysId, delta) {
        var decisionConditionGr = new GlideRecord(DecisionConditionRepository.SN_DECISION_TABLE_DECISION_CONDITION);
        var query = decisionConditionGr.addQuery("decision_table", decisionTableSysId);
        if (delta && delta.trim() != '')
            query.addOrCondition("decision_table", delta);

        decisionConditionGr.orderBy("order");
        decisionConditionGr.query();

        return decisionConditionGr;
    },
    _getDecisionConditionDetails: function(decisionCondition) {
        var conditionDetails = {};

        conditionDetails.sys_id = {
            value: decisionCondition.getValue('sys_id')
        };
        conditionDetails.label = {
            value: decisionCondition.getValue('label')
        };
        conditionDetails.decision_input = {
            value: decisionCondition.getValue('decision_input'),
            display_value: decisionCondition.decision_input.getDisplayValue()
        };
        conditionDetails.sys_scope = {
            value: decisionCondition.getValue('sys_scope'),
            display_value: decisionCondition.getDisplayValue('sys_scope')
        };
        conditionDetails.description = {
            value: decisionCondition.getValue('description')
        };
        conditionDetails.field = {
            value: decisionCondition.getValue('field')
        };
        conditionDetails.field_label = {
            value: decisionCondition.getValue('field_label')
        };
        conditionDetails.type = {
            value: decisionCondition.getValue('type'),
            display_value: decisionCondition.getDisplayValue('type')
        };
        conditionDetails.default_operator = {
            value: decisionCondition.getValue('default_operator')
        };
        conditionDetails.decision_table = {
            value: decisionCondition.getValue('decision_table'),
            display_value: decisionCondition.getDisplayValue('decision_table')
        };
        conditionDetails.reference = {
            value: decisionCondition.getValue('reference'),
            display_value: decisionCondition.getDisplayValue('reference')
        };
        conditionDetails.field_parent_table = {
            value: decisionCondition.getValue('field_parent_table'),
        };
        conditionDetails.parent = {
            value: decisionCondition.getValue('parent'),
            display_value: decisionCondition.parent.getDisplayValue()
        };
        conditionDetails.order = decisionCondition.getValue('order');

        return conditionDetails;
    },
    _getTypeSysId: function(name) {
        var gr = new GlideRecord("sys_glide_object");
        gr.addQuery("name", name);
        gr.query();

        while (gr.next()) {
            return gr.getUniqueValue();
        }
    },
    _getTableSysId: function(name) {
        var gr = new GlideRecord("sys_db_object");
        gr.addQuery("name", name);
        gr.query();

        while (gr.next()) {
            return gr.getUniqueValue();
        }
    },
    _validateDecisionConditionInput: function(decisionConditionInput) {
        var requiredDecisionConditionFields = DecisionConditionRepository.requiredDecisionConditionFields;
        var errorFields = [];
        var validationStatus = {
            status: DecisionConditionRepository.SUCCESS,
            message: ""
        };
        for (var curIndx in requiredDecisionConditionFields) {
            var currentField = requiredDecisionConditionFields[curIndx];
            var currentFieldValue = decisionConditionInput[currentField];
            if (!currentFieldValue || !currentFieldValue.trim()) {
                errorFields.push(currentField);
            }
        }

        if (errorFields.length > 0) {
            validationStatus.status = DecisionConditionRepository.FAIL;
            if (errorFields.length === 1) {
                validationStatus.message = errorFields[0] + " is a required field";
            } else {
                validationStatus.message = errorFields.join(", ") + " are required fields";
            }
        }
        return validationStatus;
    },
    type: 'DecisionConditionRepository'
};
