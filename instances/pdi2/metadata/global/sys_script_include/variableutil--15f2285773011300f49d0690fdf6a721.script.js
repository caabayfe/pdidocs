var VariableUtil = Class.create();
VariableUtil.prototype = {
    initialize: function() {

    },
    getDisplayValue: function(questionId, questionValue) {
        var question = GlideappQuestion.getQuestion(questionId);
        if (question) {
            question.setValue(questionValue);
            return question.getDisplayValue();
        }
        return this.getMultiRowSetDisplayValue(questionId, questionValue);
    },
    getMultiRowSetDisplayValue: function(vSetId, questionValue) {
        var vSetGr = new GlideRecord("item_option_new_set");
        var resultArr = [];
        if (vSetGr.get(vSetId)) {
            var multiRowSetQuestions = [];
            var multiRowSetMetaGr = new GlideRecord("item_option_new");
            multiRowSetMetaGr.addQuery("variable_set", vSetId);
            multiRowSetMetaGr.query();
            while (multiRowSetMetaGr.next()) {
                var q = GlideappQuestion.getQuestion(multiRowSetMetaGr.getUniqueValue(), multiRowSetMetaGr);
                if (q != null) {
                    multiRowSetQuestions.push(q);
                } else
                    gs.log("VariableUtil: Invalid question definition in Table variable " + vSetId + ", item_option_new record with sys_id " + multiRowSetMetaGr.getUniqueValue());
            }
            var tableVariableClassExists = JSUtil.has(sn_sc.TableVariableSetJS);
            var valArr = JSON.parse(questionValue);
            for (var i = 0; i < valArr.length; i++) {
                var processedQuestionIds = [];
                var row = valArr[i];
                for (var k = 0; k < multiRowSetQuestions.length; k++) {
                    var col = multiRowSetQuestions[k];
                    if (row.hasOwnProperty(col.getName())) {
                        processedQuestionIds.push(col.getId());
                    }
                }
                var rowVal = {};
                var questionsObj = {};
                if (tableVariableClassExists) {
                    var tableVariableSet = new sn_sc.TableVariableSetJS(vSetId);
                    tableVariableSet.setRowData(JSON.stringify(row));
                    tableVariableSet.setSequence(processedQuestionIds);
                    tableVariableSet.setFetchQuestionsFromModel(false);
                    tableVariableSet.load();
                    var questions = tableVariableSet.getFlatQuestions();
                    for (var idx = 0; idx < questions.length; idx++) {
                        var qName = questions[idx].name;
                        if (!qName)
                            continue;

                        questionsObj[qName] = questions[idx];
                    }
                }

                for (var j = 0; j < multiRowSetQuestions.length; j++) {
                    var col = multiRowSetQuestions[j];
                    if (!row.hasOwnProperty(col.getName())) {
                        continue;
                    }
                    if (row[col.getName()])
                        col.setValue(row[col.getName()]);
                    else
                        col.setValue("");
                    var displayValue = '';
                    if (col.getType() == 29 && row[col.getName()]) {
                        var parts = [];
                        parts = this.parseDurationToParts(row[col.getName()]);
                        displayValue += getDurationDisplayValue(parts);
                        rowVal[col.getName()] = displayValue;
                    } else if (col.getType() == 9 || col.getType() == 10)
                        rowVal[col.getName()] = col.getValue();
                    else {
                        if (tableVariableClassExists && questionsObj[col.getName()] != undefined)
                            displayValue = questionsObj[col.getName()].displayvalue;
                        else
                            displayValue = col.getDisplayValue();
                        rowVal[col.getName()] = displayValue;
                    }
                }
                resultArr.push(rowVal);
            }
        }
        return JSON.stringify(resultArr);

        function getDurationDisplayValue(parts) {
            var d = parseInt(parts[0], 10);
            var h = parseInt(parts[1], 10);
            var m = parseInt(parts[2], 10);
            var s = parseInt(parts[3], 10);
            var daysString = d > 0 ? d + ' ' : '';
            var timeString = [h, m, s].map(prependZero).join(':');
            return daysString + timeString;
        }

        function prependZero(number) {
            return (number < 10 ? '0' : '') + number;
        }
    },

    parseDurationToParts: function(value) {
        var MS_IN_DAY = 86400000;
        var parts = value.split(" ");
        if (parts.length == 2) {
            var times = parts[1].split(":");
            for (var i = 0; i < times.length; i++)
                parts[1 + i] = times[i];
            var dateParts = parts[0].split("-");
            if (dateParts.length == 3)
                // coming from existing record: "1970-01-05
                // 00:05:00"
                parts[0] = parseInt(Date.parse(dateParts[1] +
                    '/' + dateParts[2] + '/' +
                    dateParts[0] + ' 00:00:00 UTC')) /
                MS_IN_DAY;
        }

        return parts;
    },
    copyAttachment: function(attachmentId, targetTable, targetId) {
        var gr = new GlideRecord("sys_attachment");
        if (GlideStringUtil.isEligibleSysID(attachmentId) && gr.get(attachmentId)) {
            var sysAttach = new GlideSysAttachment();
            return sysAttach.write(targetId, targetTable, gr.getValue('file_name'), gr.getValue('content_type'), sysAttach.getContentStream(gr.getUniqueValue()));
        }
        return '';
    },
    type: 'VariableUtil'
};
