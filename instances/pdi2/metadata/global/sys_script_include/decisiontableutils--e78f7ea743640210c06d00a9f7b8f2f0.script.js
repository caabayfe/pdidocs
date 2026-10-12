var DecisionTableUtils = Class.create();

DecisionTableUtils.prototype = {
    initialize: function() {},

    copyDecisionTable: function(decisionTableSysId, copiedDecisionTableName) {
        if (!gs.hasRole("decision_table_admin")) {
            throw new Error("Insufficient privileges: User didn't had required role.");
        }

        var gr = new GlideRecord("sys_decision");
        gr.get(decisionTableSysId);
        if (gr.isValid()) {
            var tableName = gr.getValue("name");
            var application = gr.getValue("sys_scope");

            var decisionBuilderAPI = new sn_dt.DecisionTableBuilderAPI();
            var copyResult = decisionBuilderAPI.copyDecisionTable(
                decisionTableSysId,
                copiedDecisionTableName,
                true /*copy decisions*/ ,
                application,
                false /*include delta*/
            );
            var decisionTableRecord = copyResult.record;
            if (decisionTableRecord) {
                return decisionTableRecord.getValue("sys_id");
            }
        }
    },

    getRelatedRecordsSysID: function(decisionTableSysId) {
        if (!(gs.hasRole("decision_table_admin") || gs.hasRole("decision_table_reader"))) {
            throw new Error("Insufficient privileges: User didn't had required role.");
        }

        var VAR_DECISION_TABLE_INPUT = "var__m_sys_decision_input_";
        var VAR_DECISION_TABLE_MULTI_ANSWER_ELEMENT = "var__m_sys_decision_multi_result_element_";
        var tableCSV = [VAR_DECISION_TABLE_INPUT, VAR_DECISION_TABLE_MULTI_ANSWER_ELEMENT]
            .map(function(tableVar) {
                return tableVar + decisionTableSysId;
            })
            .join();
        var decisionQuestionRecords = [];
        var choiceRecords = [];
        var choiceListRecords = [];
        var metadataSnapshotRecords = [];
        var fieldLabelRecords = [];
        var decisionTableAPI = new sn_dt.DecisionTableAPI();
        var decisionTableDetails = decisionTableAPI.getDecisionTable(decisionTableSysId);

        var hasChoiceTypeRecord = decisionTableDetails.inputs
            .concat(decisionTableDetails.answerElements)
            .some(function(record) {
                return record.type === 'choice';
            });
        if (hasChoiceTypeRecord) {
            var choiceGr = new GlideRecord('sys_choice');
            choiceGr.addQuery('name', 'IN', tableCSV);
            choiceGr.query();
            while (choiceGr.next()) {
                choiceRecords.push(choiceGr.getUniqueValue());
            }

            var choiceListGr = new GlideRecord('sys_choice_set');
            choiceListGr.addQuery('name', 'IN', tableCSV);
            choiceListGr.query();
            while (choiceListGr.next()) {
                choiceListRecords.push(choiceListGr.getUniqueValue());
            }
        }

        if (decisionTableDetails.inputs.length || decisionTableDetails.answerElements.length) {
            var fieldLabelGr = new GlideRecord('sys_documentation');
            fieldLabelGr.addQuery('name', 'IN', tableCSV);
            fieldLabelGr.query();
            while (fieldLabelGr.next()) {
                fieldLabelRecords.push(fieldLabelGr.getUniqueValue());
            }
        }

        if (decisionTableDetails.questions.length) {
            decisionQuestionRecords = decisionTableDetails.questions.map(function(question) {
                return question.id;
            });
            var decisionQuestionSysIdCSV = decisionQuestionRecords.join();
            var decisionQuestionGr = new GlideRecord('sys_metadata_link');
            decisionQuestionGr.addQuery('documentkey', 'IN', decisionQuestionSysIdCSV);
            decisionQuestionGr.query();
            while (decisionQuestionGr.next()) {
                metadataSnapshotRecords.push(decisionQuestionGr.getUniqueValue());
            }

        }
        return {
            sys_decision: decisionTableDetails.id,
            sys_decision_input: decisionTableDetails.inputs.map(function(input) {
                return input.id;
            }),
            sn_decision_table_decision_condition: decisionTableDetails.conditions.map(function(condition) {
                return condition.sysId;
            }),
            sys_decision_question: decisionQuestionRecords,
            sys_decision_multi_result_element: decisionTableDetails.answerElements.map(function(answerElement) {
                return answerElement.id;
            }),
            sys_decision_multi_result: decisionTableDetails.distinctAnswers.map(function(distinctAnswer) {
                return distinctAnswer.value;
            }),
            sys_choice: choiceRecords,
            sys_choice_set: choiceListRecords,
            sys_documentation: fieldLabelRecords,
            sys_metadata_link: metadataSnapshotRecords
        };
    },

    /** 
     * hasDelegatedDeveloperAccess - Function to check whether a user has Delegated Developer access to Decision table for a specified application scope.
     * @param {String} applicationScopeSysId - Application scope sys id
     * @returns {Boolean} - Returns true if the user has Delegated Developer access to the specified application scope; otherwise, returns false.
     */
    hasDelegatedDeveloperAccess: function(applicationScopeSysId) {
        return gs.hasRightsTo('api/now.decision_tables/allow', {
            scopeId: applicationScopeSysId
        });
    },

    type: "DecisionTableUtils",
};
