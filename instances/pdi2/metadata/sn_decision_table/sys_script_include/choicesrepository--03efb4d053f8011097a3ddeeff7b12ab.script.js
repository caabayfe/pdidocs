var ChoicesRepository = Class.create();

ChoicesRepository.SYS_CHOICE = "sys_choice";
ChoicesRepository.SYS_DICTIONARY = "sys_dictionary";
ChoicesRepository.SUCCESS = "Success";
ChoicesRepository.FAIL = "Failure";
ChoicesRepository.requiredDecisionChoiceFields = [
    "value", "label"
];
ChoicesRepository.ERROR_CODES = {
    CHOICE_CREATE_FAILED: 'CHOICE_CREATE_FAILED',
    CHOICE_UPDATE_FAILED: 'CHOICE_UPDATE_FAILED',
    CHOICE_DELETE_FAILED: 'CHOICE_DELETE_FAILED',
};

ChoicesRepository.prototype = {
    initialize: function() {},
    getChoices: function(name, element, languages) {
        var tables = new GlideTableHierarchy(name).getTables();
        var choiceGr = new GlideRecord(ChoicesRepository.SYS_CHOICE);
        choiceGr.addQuery('name', 'IN', tables);
        choiceGr.addQuery("element", element);
        choiceGr.addQuery("inactive", false);
        if (languages) {
            choiceGr.addQuery('language', 'IN', languages);
        }
        choiceGr.orderBy("sequence");
        choiceGr.query();

        return choiceGr;
    },

    /**
     * Creates decision choice with given details
     * @param decisionChoice
     * @returns {Object}
     */
    createDecisionChoice: function(decisionChoice) {
        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionChoice, ChoicesRepository.requiredDecisionChoiceFields);
        if (validation.status === ChoicesRepository.FAIL) {
            return {
                status: ChoicesRepository.FAIL,
                errorCode: ChoicesRepository.ERROR_CODES.CHOICE_CREATE_FAILED,
                errorMessage: validation.message
            };
        }
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.createChoice(decisionChoice);
        if (response.status === ChoicesRepository.FAIL) {
            return {
                status: ChoicesRepository.FAIL,
                errorCode: ChoicesRepository.ERROR_CODES.CHOICE_CREATE_FAILED,
                errorMessage: 'Creation of decision choice was not successful'
            };
        }

        var choiceGR = response.record;
        return this._getDecisionChoiceDetails(choiceGR);
    },

    /**
     * Updates decision choice with given sys_id and details
     * @param sysId
     * @param decisionChoice
     * @returns {Object}
     */
    updateDecisionChoice: function(sysId, decisionChoice) {
        if (!sysId && !sysId.trim()) {
            return {
                status: ChoicesRepository.FAIL,
                errorCode: ChoicesRepository.ERROR_CODES.CHOICE_UPDATE_FAILED,
                errorMessage: 'Invalid sysId'
            };
        }
        var validation = DecisionTableUtil.validateRequiredFieldsForDecisionArtifact(decisionChoice, ChoicesRepository.requiredDecisionChoiceFields);
        if (validation.status === ChoicesRepository.FAIL) {
            return {
                status: ChoicesRepository.FAIL,
                errorCode: ChoicesRepository.ERROR_CODES.CHOICE_UPDATE_FAILED,
                errorMessage: validation.message
            };
        }


        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.updateChoice(sysId, decisionChoice);
        if (response.status === ChoicesRepository.FAIL) {
            return {
                status: ChoicesRepository.FAIL,
                errorCode: ChoicesRepository.ERROR_CODES.CHOICE_UPDATE_FAILED,
                errorMessage: 'Update of decision choice was not successful'
            };
        }

        var choiceGR = response.record;
        return this._getDecisionChoiceDetails(choiceGR);
    },

    /**
     * Deletes decision choice with given sys_id
     * @param decisionChoiceSysId
     * @returns {Object}
     */
    deleteDecisionChoice: function(decisionChoiceSysId) {
        var decisionChoiceGR = new GlideRecord(ChoicesRepository.SYS_CHOICE);
        const deleteResponse = {
            sys_id: decisionChoiceSysId,
        };
        decisionChoiceGR.get(decisionChoiceSysId);
        if (decisionChoiceGR.isValidRecord() === false) {
            deleteResponse.modified_count = 0;
        }
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var response = dt.deleteChoice(decisionChoiceSysId);

        if (response.status === ChoicesRepository.FAIL) {
            return {
                status: ChoicesRepository.FAIL,
                errorCode: ChoicesRepository.ERROR_CODES.CHOICE_DELETE_FAILED,
                errorMessage: 'Delete of decision choice was not successful'
            };
        } else {
            deleteResponse.modified_count = 1;
        }

        return deleteResponse;
    },

    _getDecisionChoiceDetails: function(decisionChoiceRecord) {
        var choiceDetails = {};


        choiceDetails.sys_id = {
            value: decisionChoiceRecord.getValue('sys_id')
        };
        choiceDetails.name = {
            value: decisionChoiceRecord.getValue('name')
        };
        choiceDetails.label = {
            value: decisionChoiceRecord.getValue('label')
        };
        choiceDetails.value = {
            value: decisionChoiceRecord.getValue('value')
        };
        choiceDetails.sequence = {
            value: decisionChoiceRecord.getValue('sequence')
        };
        choiceDetails.element = {
            value: decisionChoiceRecord.getValue('element')
        };
        choiceDetails.language = {
            value: decisionChoiceRecord.getValue('language')
        };
        return choiceDetails;
    },

    type: 'ChoicesRepository'
};
