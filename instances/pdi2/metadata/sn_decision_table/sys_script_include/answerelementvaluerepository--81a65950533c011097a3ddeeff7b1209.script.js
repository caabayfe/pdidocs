var AnswerElementValueRepository = Class.create();

AnswerElementValueRepository.MULTI_RESULT_TABLE = 'sys_decision_multi_result';
AnswerElementValueRepository.VAR_DECISION_TABLE_MULTI_ANSWER_ELEMENT = 'var__m_sys_decision_multi_result_element_';
AnswerElementValueRepository.SYS_ID = 'sys_id';

AnswerElementValueRepository.prototype = {
    initialize: function() {},
    getAnswerDetails: function(decisionTableSysId, answerSysId, answerDisplayValue) {
        var multiResultTable = AnswerElementValueRepository.VAR_DECISION_TABLE_MULTI_ANSWER_ELEMENT + decisionTableSysId;
        var gr = new GlideRecord(multiResultTable);
        var elements = gr.getElements();
        var answerElementValues = [];
        var totalElementsCount = elements.length;

        if (totalElementsCount > 1) {
            //If elements are greater than 1 then there are result elements
            var answerRecord = new GlideRecord(AnswerElementValueRepository.MULTI_RESULT_TABLE);
            answerRecord.get(answerSysId);

            if (answerRecord.isValidRecord()) {
                var resultElements = answerRecord.result_elements;

                for (var i = 0; i < totalElementsCount; i++) {
                    var element = elements[i];
                    var name = element.getName();
                    var resultElement = resultElements[name];

                    if (name !== AnswerElementValueRepository.SYS_ID) {
                        answerElementValues.push({
                            "name": name,
                            "value": resultElement.toString(),
                            "displayValue": resultElement.getDisplayValue()
                        });
                    }
                }
            }
        }


        return {
            value: answerSysId,
            displayValue: answerDisplayValue,
            answerElementValues: answerElementValues
        };
    },
    type: 'AnswerElementValueRepository'
};
