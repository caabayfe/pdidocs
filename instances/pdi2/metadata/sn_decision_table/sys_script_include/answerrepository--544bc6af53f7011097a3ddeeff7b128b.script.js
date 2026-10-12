var AnswerRepository = Class.create();
AnswerRepository.prototype = {
    initialize: function() {},

    getOrCreateMultipleAnswerRecords: function(decisionTableSysId, answerElementValuesDetails) {
        var answerElementValuesMap = this._getAnswerElementValuesMap(answerElementValuesDetails);
        var questionAnswerLabelMap = this._getQuestionAnswerLabelMap(answerElementValuesDetails);
        var dt = new sn_dt.DecisionTableBuilderAPI();
        var multiAnswerRecordDetails = dt.findOrCreateMultipleAnswerRecords(decisionTableSysId, answerElementValuesMap, questionAnswerLabelMap);

        var answerElementValuesList = [];
        for (var key in multiAnswerRecordDetails) {
            if (multiAnswerRecordDetails.hasOwnProperty(key)) {
                answerElementValuesList.push({
                    decisionQuestionSysId: key,
                    answerSysId: multiAnswerRecordDetails[key]
                });
            }
        }

        return answerElementValuesList;
    },

    _getQuestionAnswerLabelMap: function(answerElementValuesDetails) {
        var questionAnswerLabelMap = new Object();

        for (var i = 0; i < answerElementValuesDetails.length; i++) {
            var currentAnswerElementValueDetails = answerElementValuesDetails[i];
            var decisionQuestionId = currentAnswerElementValueDetails.decisionQuestionSysId;
            var label = currentAnswerElementValueDetails.label;
            questionAnswerLabelMap[decisionQuestionId] = label;
        }
		
        return questionAnswerLabelMap;
    },

    _getAnswerElementValuesMap: function(answerElementValuesDetails) {
        var answerElementValuesMap = new Object();

        for (var i = 0; i < answerElementValuesDetails.length; i++) {
            var currentAnswerElementValueDetails = answerElementValuesDetails[i];
            var decisionQuestionId = currentAnswerElementValueDetails.decisionQuestionSysId;
            var answerElementValues = currentAnswerElementValueDetails.answerElementValues;
            var answerElementValuesObj = new Object();

            for (var j = 0; j < answerElementValues.length; j++) {
                answerElementValuesObj[answerElementValues[j].name] = answerElementValues[j].value;
            }
            answerElementValuesMap[decisionQuestionId] = answerElementValuesObj;
        }

        return answerElementValuesMap;
    },

    getOrCreateMultipleAnswerRecord: function(decisionTableSysId, answerElementValues, answerLabel) {
        var answerElementValuesObj = new Object();
        for (var i = 0; i < answerElementValues.length; i++) {
            answerElementValuesObj[answerElementValues[i].name] = answerElementValues[i].value;
        }
        answerElementValuesObj.label = answerLabel;


        var dt = new sn_dt.DecisionTableAPI();
        return dt.findOrCreateMultipleAnswerRecord(decisionTableSysId, answerElementValuesObj);
    },
    type: 'AnswerRepository'
};
