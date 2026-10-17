var AnswerElementRepository = Class.create();

AnswerElementRepository.SYS_DECISION_MULTI_RESULT_ELEMENT = "sys_decision_multi_result_element";
AnswerElementRepository.SUCCESS = "Success";
AnswerElementRepository.FAIL = "Failure";
AnswerElementRepository.requiredAnswerElementFields = [
    "internal_type", "label", "element"
];
AnswerElementRepository.ERROR_CODES = {
    ANSWER_ELEMENT_CREATE_FAILED: 'ANSWER_ELEMENT_CREATE_FAILED',
    ANSWER_ELEMENT_UPDATE_FAILED: 'ANSWER_ELEMENT_UPDATE_FAILED',
    ANSWER_ELEMENT_DELETE_FAILED: 'ANSWER_ELEMENT_DELETE_FAILED',
};

AnswerElementRepository.prototype = {
    initialize: function() {},

    /**
     * Returns list of answer element records for a decision table
     * @param decisionTableSysId
     * @returns {GlideRecord}
     */
    getAnswerElementsOfDecisionTable: function(decisionTableSysId, delta) {
        // using GlideRecord because we already have a access check in the resolver and avoid display value issues for delegated developer
        var answerElementGr = new GlideRecord(AnswerElementRepository.SYS_DECISION_MULTI_RESULT_ELEMENT);
        var query = answerElementGr.addQuery("model", decisionTableSysId);
        if (delta && delta.trim() != '')
            query.addOrCondition("model", delta);

        answerElementGr.orderBy("order");
        answerElementGr.query();

        return answerElementGr;
    },

    /**
     * Creates decision answer element with given details
     * @param decisionAnswerElement
     * @returns {Object}
     */
    createAnswerElement: function(decisionAnswerElement) {
        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionAnswerElement, AnswerElementRepository.requiredAnswerElementFields);
        if (validation.status === AnswerElementRepository.FAIL) {
            return {
                status: AnswerElementRepository.FAIL,
                errorCode: AnswerElementRepository.ERROR_CODES.ANSWER_ELEMENT_CREATE_FAILED,
                errorMessage: validation.message
            };
        }

        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.createAnswerElement(decisionAnswerElement);
        if (response.status === AnswerElementRepository.FAIL) {
            return {
                status: AnswerElementRepository.FAIL,
                errorCode: AnswerElementRepository.ERROR_CODES.ANSWER_ELEMENT_CREATE_FAILED,
                errorMessage: 'Creation of answer element was not successful'
            };
        }
        var answerElementGR = response.record;
        return this._getAnswerElementDetails(answerElementGR);
    },

    /**
     * Updates decision answer element with given sys_id and details
     * @param sysId
     * @param decisionAnswerElement
     * @returns {Object}
     */
    updateAnswerElement: function(sysId, decisionAnswerElement) {
        if (!sysId && !sysId.trim()) {
            return {
                status: AnswerElementRepository.FAIL,
                errorCode: AnswerElementRepository.ERROR_CODES.ANSWER_ELEMENT_UPDATE_FAILED,
                errorMessage: 'Invalid sysId'
            };
        }
        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionAnswerElement, AnswerElementRepository.requiredAnswerElementFields);
        if (validation.status === AnswerElementRepository.FAIL) {
            return {
                status: AnswerElementRepository.FAIL,
                errorCode: AnswerElementRepository.ERROR_CODES.ANSWER_ELEMENT_UPDATE_FAILED,
                errorMessage: validation.message
            };
        }
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.updateAnswerElement(sysId, decisionAnswerElement);
        if (response.status === AnswerElementRepository.FAIL) {
            return {
                status: AnswerElementRepository.FAIL,
                errorCode: AnswerElementRepository.ERROR_CODES.ANSWER_ELEMENT_UPDATE_FAILED,
                errorMessage: 'Update of answer element was not successful'
            };
        }
        var answerElementGR = response.record;
        return this._getAnswerElementDetails(answerElementGR);
    },

    /**
     * Deletes decision answer element with given sys_id
     * @param decisionAnswerElementSysId
     * @returns {Object}
     */
    deleteAnswerElement: function(decisionAnswerElementSysId) {
        var decisionAnswerElementGr = new GlideRecord(AnswerElementRepository.SYS_DECISION_MULTI_RESULT_ELEMENT);
        const deleteResponse = {
            sys_id: decisionAnswerElementSysId,
        };
        decisionAnswerElementGr.get(decisionAnswerElementSysId);
        if (decisionAnswerElementGr.isValidRecord() === false) {
            deleteResponse.modified_count = 0;
        }
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.deleteAnswerElement(decisionAnswerElementSysId);

        if (response.status === AnswerElementRepository.FAIL) {
            return {
                status: AnswerElementRepository.FAIL,
                errorCode: AnswerElementRepository.ERROR_CODES.ANSWER_ELEMENT_DELETE_FAILED,
                errorMessage: 'Delete of answer element was not successful'
            };
        } else {
            deleteResponse.modified_count = 1;
        }

        return deleteResponse;
    },

    _getAnswerElementDetails: function(answerElementRecord) {
        var answerElementDetails = {};

        answerElementDetails.sys_class_name = {
            value: answerElementRecord.getValue('sys_class_name')
        };
        answerElementDetails.sys_id = {
            value: answerElementRecord.getValue('sys_id')
        };
        answerElementDetails.internal_type = {
            value: answerElementRecord.getValue('internal_type'),
            display_value: answerElementRecord.internal_type.getDisplayValue()
        };
        answerElementDetails.model = {
            value: answerElementRecord.getValue('model'),
            display_value: answerElementRecord.model.getDisplayValue()
        };
        answerElementDetails.parent = {
            value: answerElementRecord.getValue('parent'),
            display_value: answerElementRecord.parent.getDisplayValue()
        };
        answerElementDetails.reference = {
            value: answerElementRecord.getValue('reference'),
            display_value: answerElementRecord.getDisplayValue('reference')
        };
        answerElementDetails.reference_qual_condition = {
            value: answerElementRecord.getValue('reference_qual_condition'),
            display_value: answerElementRecord.getDisplayValue('reference_qual_condition')
        };
        answerElementDetails.sys_scope = {
            value: answerElementRecord.getValue('sys_scope'),
            display_value: answerElementRecord.getDisplayValue('sys_scope')
        };
        answerElementDetails.comments = {
            value: answerElementRecord.getValue('comments'),
        };
        answerElementDetails.element = {
            value: answerElementRecord.getValue('element')
        };
        answerElementDetails.max_length = {
            value: answerElementRecord.getValue('max_length'),
        };
        answerElementDetails.name = {
            value: answerElementRecord.getValue('name')
        };
        answerElementDetails.label = {
            value: answerElementRecord.getValue('label'),
        };
        answerElementDetails.active = {
            value: !!(parseInt(answerElementRecord.getValue('active'), 10))
        };
        answerElementDetails.order = {
            value: answerElementRecord.getValue('order')
        };
        answerElementDetails.choice = {
            value: answerElementRecord.getValue('choice'),
            display_value: answerElementRecord.getDisplayValue('choice')
        };
        answerElementDetails.choice_table = {
            value: answerElementRecord.getValue('choice_table'),
            displayValue: answerElementRecord.getDisplayValue('choice_table')
        };
        answerElementDetails.choice_field = {
            value: answerElementRecord.getValue('choice_field'),
            displayValue: answerElementRecord.getDisplayValue('choice_field')
        };

        return answerElementDetails;
    },

    type: 'AnswerElementRepository'
};
