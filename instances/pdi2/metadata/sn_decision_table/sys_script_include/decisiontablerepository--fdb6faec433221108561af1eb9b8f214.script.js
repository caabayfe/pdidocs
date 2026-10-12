var DecisionTableRepository = Class.create();

DecisionTableRepository.SUCCESS = "Success";
DecisionTableRepository.FAIL = "Failure";
DecisionTableRepository.allowedClassNames = ["sys_decision", "chg_policy_approval", "sys_decision_delta"];
DecisionTableRepository.requiredDecisionTableFields = [
    "name", "sys_scope"
];
DecisionTableRepository.SYS_DECISION = "sys_decision";
DecisionTableRepository.ERROR_CODES = {
    DECISION_TABLE_CREATE_FAILED: 'DECISION_TABLE_CREATE_FAILED',
    DECISION_TABLE_UPDATE_FAILED: 'DECISION_TABLE_UPDATE_FAILED',
    DECISION_TABLE_DELETE_FAILED: 'DECISION_TABLE_DELETE_FAILED',
};
DecisionTableRepository.prototype = {
    initialize: function() {},

    /**
     * Creates decision table with given details
     * @param className
     * @param decisionTable
     * @returns {Object}
     */
    createDecisionTable: function(className, decisionTable) {
        var isValidClassName = className && className.trim() != '' && DecisionTableRepository.allowedClassNames.includes(className);
        if (!isValidClassName) {
            return {
                errorStatus: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_CREATE_FAILED,
                errorMessage: 'Invalid class name'
            };
        }

        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionTable, DecisionTableRepository.requiredDecisionTableFields);
        if (validation.status === DecisionTableRepository.FAIL) {
            return {
                errorStatus: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_CREATE_FAILED,
                errorMessage: validation.message
            };
        }

        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.createDecisionTable(className, decisionTable);
        if (response.status === DecisionTableRepository.FAIL) {
            return {
                errorStatus: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_CREATE_FAILED,
                errorMessage: 'Creation of decision table was not successful'
            };
        }

        var decisionTableGR = response.record;
        return this._getDecisionTableDetails(decisionTableGR);

    },

    /**
     * Updates decision table for given className, sys_id and details
     * @param className
     * @param decisionId
     * @param decisionTable
     * @returns {Object}
     */
    updateDecisionTable: function(className, decisionId, decisionTable) {
        var isValidClassName = className && className.trim() != '' && DecisionTableRepository.allowedClassNames.includes(className);
        if (!isValidClassName) {
            return {
                errorStatus: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_UPDATE_FAILED,
                errorMessage: 'Invalid class name'
            };
        }

        if (!decisionId && !decisionId.trim()) {
            return {
                errorStatus: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_UPDATE_FAILED,
                errorMessage: 'Invalid decisionId'
            };
        }

        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.updateDecisionTable(className, decisionId, decisionTable);
        if (response.status === DecisionTableRepository.FAIL) {
            return {
                errorStatus: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_UPDATE_FAILED,
                errorMessage: 'Update of decision table was not successful'
            };
        }

        var decisionTableGR = response.record;
        return this._getDecisionTableDetails(decisionTableGR);

    },


    /**
     * Deletes decision table with given sys_id
     * @param decisionTableSysId
     * @returns {Object}
     */
    deleteDecisionTable: function(decisionTableSysId) {
        var decisionTableGr = new GlideRecord(DecisionTableRepository.SYS_DECISION);
        const deleteResponse = {
            sys_id: decisionTableSysId,
        };
        decisionTableGr.get(decisionTableSysId);
        if (decisionTableGr.isValidRecord() === false) {
            deleteResponse.modified_count = 0;
        }
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.deleteDecisionTable(decisionTableSysId);

        if (response.status === DecisionTableRepository.FAIL) {
            return {
                status: DecisionTableRepository.FAIL,
                errorCode: DecisionTableRepository.ERROR_CODES.DECISION_TABLE_DELETE_FAILED,
                errorMessage: 'Delete of decision table was not successful'
            };
        } else {
            deleteResponse.modified_count = 1;
        }

        return deleteResponse;
    },

    _getDecisionTableDetails: function(decisionTableGR) {
        var decisionTableDetails = {};

        decisionTableDetails.name = {
            value: decisionTableGR.getValue('name'),
            display_value: decisionTableGR.name.getDisplayValue()
        };
        decisionTableDetails.description = {
            value: decisionTableGR.getValue('description'),
            display_value: decisionTableGR.description.getDisplayValue()
        };
        decisionTableDetails.label = {
            value: decisionTableGR.getValue('label'),
            display_value: decisionTableGR.label.getDisplayValue()
        };
        decisionTableDetails.active = {
            value: !!(parseInt(decisionTableGR.getValue('active'), 10))
        };
        decisionTableDetails.answer_table = {
            value: decisionTableGR.getValue('answer_table'),
            display_value: decisionTableGR.answer_table.getDisplayValue()
        };
        decisionTableDetails.answer_type = {
            value: decisionTableGR.getValue('answer_type'),
            display_value: decisionTableGR.answer_type.getDisplayValue()
        };
        decisionTableDetails.reference_qualifier = {
            value: decisionTableGR.getValue('reference_qualifier'),
            display_value: decisionTableGR.reference_qualifier.getDisplayValue()
        };
        decisionTableDetails.access = {
            value: decisionTableGR.getValue('access'),
            display_value: decisionTableGR.access.getDisplayValue()
        };
        decisionTableDetails.delta = {
            value: decisionTableGR.getValue('delta'),
            display_value: decisionTableGR.delta.getDisplayValue()
        };

        decisionTableDetails.enable_publishing = {
            value: !!(parseInt(decisionTableGR.getValue('enable_publishing'), 10))
        };
        decisionTableDetails.sys_id = {
            value: decisionTableGR.getValue('sys_id'),
        };
        decisionTableDetails.status = {
            value: decisionTableGR.getValue('status'),
            display_value: decisionTableGR.status.getDisplayValue()
        };
        decisionTableDetails.execution = {
            value: decisionTableGR.getValue('execution') || '',
            display_value: decisionTableGR.execution ? decisionTableGR.execution.getDisplayValue() : ''
        };

        decisionTableDetails.sys_scope = {
            value: decisionTableGR.getValue('sys_scope'),
            display_value: decisionTableGR.sys_scope.getDisplayValue()
        };
        decisionTableDetails.sys_created_on = {
            value: decisionTableGR.getValue('sys_created_on'),
            display_value: decisionTableGR.sys_created_on.getDisplayValue()
        };
        decisionTableDetails.sys_class_name = {
            value: decisionTableGR.getValue('sys_class_name'),
            display_value: decisionTableGR.sys_class_name.getDisplayValue()
        };
        decisionTableDetails.parent = {
            value: decisionTableGR.getValue('parent') || '',
            display_value: decisionTableGR.parent ? decisionTableGR.parent.getDisplayValue() : ''
        };
        decisionTableDetails.sys_domain = {
            value: decisionTableGR.getValue('sys_domain'),
            display_value: decisionTableGR.sys_domain.getDisplayValue()
        };
		decisionTableDetails.sys_policy = {
			value: decisionTableGR.getValue('sys_policy'),
		};

        return decisionTableDetails;
    },

    type: 'DecisionTableRepository'
};
