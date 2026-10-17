var DecisionQuestionRepository = Class.create();

DecisionQuestionRepository.SYS_DECISION_MULTI_RESULT = "sys_decision_multi_result";
DecisionQuestionRepository.SYS_DECISION_QUESTION = "sys_decision_question";
DecisionQuestionRepository.INPUT_TABLE_PREFIX = "var__m_sys_decision_input_";
DecisionQuestionRepository.ORDER = "order";
DecisionQuestionRepository.SYS_ID = "sys_id";
DecisionQuestionRepository.DECISION_TABLE = "decision_table";
DecisionQuestionRepository.ANSWER = "answer";
DecisionQuestionRepository.DEFAULT_ANSWER = "default_answer";
DecisionQuestionRepository.ACTIVE = "active";
DecisionQuestionRepository.CONDITION = "condition";
DecisionQuestionRepository.LABEL = "label";
DecisionQuestionRepository.MARKED_FOR_DELETION = "marked_for_deletion";

DecisionQuestionRepository.prototype = {
    initialize: function() {},
    getDecisionsByDecisionTable: function(sysId, firstRow, lastRow, defaultAnswer) {
        var decisionsGr = new GlideRecord(DecisionQuestionRepository.SYS_DECISION_QUESTION);
        decisionsGr.addQuery(DecisionQuestionRepository.DECISION_TABLE, sysId);
        decisionsGr.addQuery(DecisionQuestionRepository.DEFAULT_ANSWER, defaultAnswer);
        decisionsGr.orderBy(DecisionQuestionRepository.ORDER);
        decisionsGr.orderBy(DecisionQuestionRepository.SYS_ID);
        decisionsGr.chooseWindow(firstRow, lastRow);
        decisionsGr.query();

        return decisionsGr;
    },

    getObsoleteDecisionsByDecisionTable: function(sysId) {
        var decisionsGr = new GlideRecord(DecisionQuestionRepository.SYS_DECISION_QUESTION);
        decisionsGr.addQuery(DecisionQuestionRepository.DECISION_TABLE, sysId);
        decisionsGr.addQuery(DecisionQuestionRepository.MARKED_FOR_DELETION, true);
        decisionsGr.query();

        return decisionsGr;
    },
    getDecisionsIncludingDelta: function(sysId, deltaSysId, firstRow, lastRow, includeDefaultDecision) {
        var decisionsGr = new GlideRecord(DecisionQuestionRepository.SYS_DECISION_QUESTION);
        decisionsGr.addQuery(DecisionQuestionRepository.DECISION_TABLE, sysId).addOrCondition(DecisionQuestionRepository.DECISION_TABLE, deltaSysId);
        decisionsGr.addQuery(DecisionQuestionRepository.MARKED_FOR_DELETION, false);
        var defaultAnswerValue = (includeDefaultDecision === true || includeDefaultDecision == "true") ? true : false;
        decisionsGr.addQuery(DecisionQuestionRepository.DEFAULT_ANSWER, defaultAnswerValue);

        decisionsGr.orderBy(DecisionQuestionRepository.ORDER);
        decisionsGr.orderBy(DecisionQuestionRepository.SYS_ID);
        decisionsGr.chooseWindow(firstRow, lastRow);
        decisionsGr.query();

        return decisionsGr;
    },
    deleteObsoleteDecisions: function(sysId) {
        var builderAPI = new sn_dt.DecisionTableBuilderAPI();
        return builderAPI.deleteObsoleteQuestions(sysId);
    },
    syncDecisionsFromDelta: function(sysId, deltaSysId, answerTable) {
        var builderAPI = new sn_dt.DecisionTableBuilderAPI();
        return builderAPI.syncQuestionsFromDelta(sysId, deltaSysId, answerTable);
    },
    filterDecisions: function(sysId, deltaSysId, filterInPublishedDecisions, answerTable, fromIndex, resultsCount, filterPatternConfigs) {
        const conditionTypes = {
            STRING: "string",
            STRING_UTF: "string_full_utf8",
            BOOLEAN: "boolean",
            INTEGER: "integer",
            DECIMAL: "decimal",
            CHOICE: "choice",
            REFERENCE: "reference",
            GLIDE_DATE: "glide_date",
            GLIDE_DATE_TIME: "glide_date_time",
			DUE_DATE: "due_date",
			CURRENCY: "currency",
			LONG: "longint"
        };
        const operators = {
            ON: {
                value: "ON",
                supportedTypes: [conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE],
            },
            NOT_ON: {
                value: "NOTON",
                supportedTypes: [conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE],
            },
            EQUALS: {
                value: "=",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            NOT_EQUALS: {
                value: "!=",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            STARTS_WITH: {
                value: "STARTSWITH",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.LONG],
            },
            ENDS_WITH: {
                value: "ENDSWITH",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.LONG],
            },
            CONTAINS: {
                value: "LIKE",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            DOES_NOT_CONTAIN: {
                value: "NOT LIKE",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            IS_EMPTY: {
                value: "ISEMPTY",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.REFERENCE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            IS_NOT_EMPTY: {
                value: "ISNOTEMPTY",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.REFERENCE, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            GREATER_THAN: {
                value: ">",
                supportedTypes: [conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY],
            },
            GREATER_THAN_FIELD: {
                value: "GT_FIELD",
                supportedTypes: [conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CURRENCY],
            },
            GREATER_THAN_EQUAL_TO: {
                value: ">=",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            GREATER_THAN_EQUAL_TO_FIELD: {
                value: "GT_OR_EQUALS_FIELD",
                supportedTypes: [conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CURRENCY, conditionTypes.CURRENCY],
            },
            LESS_THAN: {
                value: "<",
                supportedTypes: [conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY],
            },
            LESS_THAN_FIELD: {
                value: "LT_FIELD",
                supportedTypes: [conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CURRENCY],
            },
            LESS_THAN_EQUAL_TO: {
                value: "<=",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            LESS_THAN_EQUAL_TO_FIELD: {
                value: "LT_OR_EQUALS_FIELD",
                supportedTypes: [conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CURRENCY],
            },
            IS_EMPTY_STRING: {
                value: "EMPTYSTRING",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.REFERENCE, conditionTypes.LONG],
            },
            BETWEEN: {
                value: "BETWEEN",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CHOICE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            ANYTHING: {
                value: "ANYTHING",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            IS_ONE_OF: {
                value: "IN",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.CHOICE, conditionTypes.LONG],
            },
            IS_NOT_ONE_OF: {
                value: "NOT IN",
                supportedTypes: [conditionTypes.CHOICE],
            },
            IS_SAME_AS: {
                value: "SAMEAS",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            IS_DIFFERENT_FROM: {
                value: "NSAMEAS",
                supportedTypes: [conditionTypes.STRING, conditionTypes.STRING_UTF, conditionTypes.BOOLEAN, conditionTypes.INTEGER, conditionTypes.DECIMAL, conditionTypes.CHOICE, conditionTypes.REFERENCE, conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE, conditionTypes.CURRENCY, conditionTypes.LONG],
            },
            DATE_PART: {
                value: "DATEPART",
                supportedTypes: [conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE]
            },
            RELATIVE: {
                value: "RELATIVE",
                supportedTypes: [conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE]
            },
            IS_MORE_THAN: {
                value: "MORETHAN",
                supportedTypes: [conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE]
            },
            IS_LESS_THAN: {
                value: "LESSTHAN",
                supportedTypes: [conditionTypes.GLIDE_DATE, conditionTypes.GLIDE_DATE_TIME, conditionTypes.DUE_DATE]
            },
            DYNAMIC: {
                value: "DYNAMIC",
                supportedTypes: [conditionTypes.REFERENCE],
            },
        };

        const filterConfig = filterPatternConfigs.map(filterPatternConfig => {
            if (filterPatternConfig.answerSearch) {
                return filterPatternConfig;
            }

            const conditionFilterConfig = {
                conditionSearch: true
            };
            const {
                conditionName,
                conditionType,
                filterOperator,
                filterValue
            } =
            filterPatternConfig;

            const supportedOperators = Object.keys(operators).reduce((operatorList, operator) => {
                if (operators[operator].supportedTypes.includes(conditionType)) {
                    operatorList.push(operators[operator].value);
                }
                return operatorList;
            }, []);

            let pattern = "";
            let negation = false;

            const equalsPattern = `(${conditionName})(${supportedOperators.join("|")})(${filterValue})(\\^)`;

            /**
             * Matches contains Pattern - eg u_age=23^u_name=ServiceNow^EQ
             * 
             * This pattern will match [ConditionName][can match any SupportedOperators][it will match filterValue and breaks when it finds first ^ character.]
             * 
             * if filterValue is 2 then for above example, it will match u_age={contains 2} but will not match anything after ^ character.
             */
            const containsPattern = `(${conditionName})(${supportedOperators.join("|")})(([^\\^]*)${filterValue}([^\\^]*))(\\^)`;

            const isNotEmptyPattern = `(${conditionName})(${supportedOperators.join("|")})((.*))(\\^)`;

            switch (filterOperator) {
                case operators.EQUALS.value:
                    pattern = equalsPattern;
                    break;
                case operators.NOT_EQUALS.value:
                    pattern = equalsPattern;
                    negation = true;
                    break;
                case operators.CONTAINS.value:
					if(conditionType == conditionTypes.CURRENCY)
						pattern = equalsPattern;
					else
						pattern = containsPattern;
                    break;
                case operators.DOES_NOT_CONTAIN.value:
                    if(conditionType == conditionTypes.CURRENCY)
						pattern = equalsPattern;
					else
						pattern = containsPattern;
                    negation = true;
                    break;
                case operators.IS_EMPTY.value:
                    pattern = isNotEmptyPattern;
                    negation = true;
                    break;
                case operators.IS_NOT_EMPTY.value:
                    pattern = isNotEmptyPattern;
                    break;
                default:
                    pattern = "";
            }

            conditionFilterConfig.pattern = pattern;
            conditionFilterConfig.negation = negation;

            return conditionFilterConfig;
        });

        const dt = new sn_dt.DecisionTableBuilderAPI();
        return dt.getFilteredQuestions(sysId, deltaSysId, filterInPublishedDecisions, answerTable, fromIndex, resultsCount, filterConfig);
    },
    getOrCreateMultiAnswerRecord: function(decisionTableDetails, targetDecisionDetails) {
        const {
            targetDecisionSysId,
            answerId
        } = targetDecisionDetails;
        const {
            answerElements,
            deltaSysId
        } = decisionTableDetails;
        const originalAnswerGr = new GlideRecord(DecisionQuestionRepository.SYS_DECISION_MULTI_RESULT);
        originalAnswerGr.get(answerId);
        const resultElements = originalAnswerGr.result_elements;
        const answerElementValues = [];
        answerElements.forEach(element => answerElementValues.push({
            name: element,
            value: resultElements[element].getValue()
        }));

        const answerElementValuesDetails = [{
            decisionQuestionSysId: targetDecisionSysId,
            answerElementValues: answerElementValues,
            label: originalAnswerGr.getValue(DecisionQuestionRepository.LABEL)
        }];

        const response = new sn_decision_table.AnswerRepository().getOrCreateMultipleAnswerRecords(deltaSysId, answerElementValuesDetails);
        
		return response[0].answerSysId;
    },
    updateDecisionOrder: function({
        api,
        targetDecisionDetails,
        targetOrder,
        decisionTableDetails
    }) {
        let {
            deltaSysId,
            answerTable,
            decisionTableName
        } = decisionTableDetails;
        let {
            targetDecisionSysId,
            dtOfTargetDecision,
            answerId
        } = targetDecisionDetails;

        const hasDeltaSysId = deltaSysId.trim().length > 0;
        if (hasDeltaSysId && dtOfTargetDecision !== deltaSysId) {
            const response = api.updateQuestion(targetDecisionSysId, {
                marked_for_deletion: true
            });

            const answer = answerTable === DecisionQuestionRepository.SYS_DECISION_MULTI_RESULT && answerId !== '' ? this.getOrCreateMultiAnswerRecord(decisionTableDetails, targetDecisionDetails) : answerId;
            const existingDecisionGr = response.record;
            api.createQuestion({
                order: targetOrder,
                decision_table: deltaSysId,
                input_table: `${DecisionQuestionRepository.INPUT_TABLE_PREFIX}${deltaSysId}`,
                active: existingDecisionGr.getValue(DecisionQuestionRepository.ACTIVE),
                answer: answer,
                label: `${decisionTableName}_${targetOrder}`,
                condition: existingDecisionGr.getValue(DecisionQuestionRepository.CONDITION),
                default_answer: false,
                marked_for_deletion: false
            });
            return;
        }

        api.updateQuestion(targetDecisionSysId, {
            order: targetOrder
        });
    },
    /**
     * decisionTableDetails: {sysId, deltaSysId, isMultiResult, decisionTableName, answerElements}
     * targetIndex: 
     * 				a) In case of reordering to other pages this is the index of the previous decision at which the targetDecision is being inserted
     * 				b) In case of resolving the collision(adding/duplicating a decision/reordering within the page) this is the index from which increment has to happen till the conflict is resolved
     * targetDecisionDetails: { // relevant only when reordering to other page. Details are related to the decision being reordered
     * 							targetDecisionSysId:decision question sysid of the target decision
     * 							dtOfTargetDecision: dt of the target decision
     * 							answerId: answerId of the target decision
     * 						}
     * isIncrementOnly: will be passed as false when decision is reordered outside of the current page( either previous page or current page)
     * previousOrderInClient: order of the last decision in client, only required when isIncrementOnly is true
     */
    accommodateReorderedDecision: function({
        decisionTableDetails,
        targetIndex,
        targetDecisionDetails,
        isIncrementOnly,
        previousOrderInClient
    }) {
        let {
            sysId,
            deltaSysId
        } = decisionTableDetails;
        let {
            targetDecisionSysId,
            dtOfTargetDecision
        } = targetDecisionDetails || {};

        let nextToBeLoadedDecisionOrder;
        const hasDeltaSysId = deltaSysId.trim().length > 0;
        const dt = new sn_dt.DecisionTableBuilderAPI();

        let gr;
        let previousOrder;
        let currentOrder;
        let targetOrder = -1;

        if (isIncrementOnly) {
            const decisionsGr = hasDeltaSysId ?
                this.getDecisionsIncludingDelta(sysId, deltaSysId, targetIndex, targetIndex + 1, false) :
                this.getDecisionsByDecisionTable(sysId, targetIndex, targetIndex + 1, false);

            decisionsGr.next();
            targetDecisionDetails = {
                targetDecisionSysId: decisionsGr.getValue(DecisionQuestionRepository.SYS_ID),
                dtOfTargetDecision: decisionsGr.getValue(DecisionQuestionRepository.DECISION_TABLE),
                answerId: decisionsGr.getValue(DecisionQuestionRepository.ANSWER)
            };
            previousOrder = previousOrderInClient + 1;

            /*
            	The decision is reordered within the same page and by virtue of which there is a collision and the collision didn't get resolved in the client side.
            	So that means we need to update the nextToBeLoadedDecisionOrder in the client side, so we will be sending this back to the client to update the nextToBeLoadedDecisionOrder with correct value
            */
            nextToBeLoadedDecisionOrder = previousOrder;

            gr = hasDeltaSysId ?
                this.getDecisionsIncludingDelta(sysId, deltaSysId, targetIndex + 1, decisionsGr.getRowCount(), false) :
                this.getDecisionsByDecisionTable(sysId, targetIndex + 1, decisionsGr.getRowCount(), false);
        } else {
            const decisionsGr = hasDeltaSysId ?
                this.getDecisionsIncludingDelta(sysId, deltaSysId, targetIndex, targetIndex + 2, false) :
                this.getDecisionsByDecisionTable(sysId, targetIndex, targetIndex + 2, false);

            let fetchedDecisionsCount = 0;
            let currentDecisionOrder;
            let nextDecisionOrder;
            while (decisionsGr.next()) {
                const iterationOrder = +decisionsGr.getValue(DecisionQuestionRepository.ORDER);
                fetchedDecisionsCount++;
                if (fetchedDecisionsCount === 1) {
                    currentDecisionOrder = iterationOrder;
                } else {
                    nextDecisionOrder = iterationOrder;
                }
            }

            if (fetchedDecisionsCount === 0) {
                return -1;
            }

            if (fetchedDecisionsCount === 1 || (fetchedDecisionsCount === 2 && nextDecisionOrder > currentDecisionOrder + 1)) {
                // no collision, just update the order
                targetOrder =
                    fetchedDecisionsCount === 1 ? currentDecisionOrder + 100 : Math.ceil((currentDecisionOrder + nextDecisionOrder) / 2);

                this.updateDecisionOrder({
                    api: dt,
                    targetDecisionDetails,
                    targetOrder,
                    decisionTableDetails,
                });
                return targetOrder;
            }

            targetOrder = Math.ceil((currentDecisionOrder + nextDecisionOrder) / 2);
            previousOrder = targetOrder;

            //There is not enough gap for the target deicsion to be accomodated so we are fixing that here by incrementing the orders till there is a gap
            const fromIndex = targetIndex + 1;
            gr = hasDeltaSysId ?
                this.getDecisionsIncludingDelta(sysId, deltaSysId, fromIndex, decisionsGr.getRowCount(), false) :
                this.getDecisionsByDecisionTable(sysId, fromIndex, decisionsGr.getRowCount(), false);
        }


        while (gr.next()) {
            if (targetDecisionDetails.targetDecisionSysId && gr.getValue(DecisionQuestionRepository.SYS_ID) === targetDecisionDetails.targetDecisionSysId) {
                // we should not consider the decision which is being reordered as we have already determined the final order for that decision (i.e targetOrder)
                continue;
            }
            currentOrder = +gr.getValue(DecisionQuestionRepository.ORDER);
            if (currentOrder > previousOrder) {
                break;
            }

            currentOrder = previousOrder + 1;
            const currentTargetDecisionDetails = {
                targetDecisionSysId: gr.getValue(DecisionQuestionRepository.SYS_ID),
                dtOfTargetDecision: gr.getValue(DecisionQuestionRepository.DECISION_TABLE),
                answerId: gr.getValue(DecisionQuestionRepository.ANSWER)
            };
            this.updateDecisionOrder({
                api: dt,
                targetDecisionDetails: currentTargetDecisionDetails,
                targetOrder: currentOrder,
                decisionTableDetails,
            });
            previousOrder = currentOrder;
        }

        if (isIncrementOnly) {
            this.updateDecisionOrder({
                api: dt,
                targetDecisionDetails,
                targetOrder: nextToBeLoadedDecisionOrder,
                decisionTableDetails,
            });
            return nextToBeLoadedDecisionOrder;
        } else {
            this.updateDecisionOrder({
                api: dt,
                targetDecisionDetails,
                targetOrder: targetOrder,
                decisionTableDetails,
            });
			return targetOrder;
        }
    },

    type: 'DecisionQuestionRepository'
};
