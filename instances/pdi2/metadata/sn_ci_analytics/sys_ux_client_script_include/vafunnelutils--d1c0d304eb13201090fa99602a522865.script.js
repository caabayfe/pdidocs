function include({imports}, api = {}, helpers = {}) {
    const {
        findComparisonAndExecuteCallback,
        getParentComparison,
        guid
    } = imports['sn_ci_analytics.VAConditionBuilderUtils']();
    const CHOICE_SINGLE_SELECT = 'choice_single_select';
    const EVENT_TRIGGER = 'Event Trigger';
    const TOPIC = 'Topic';
    const TOPIC_NODE = 'Topic Node';
    const CONVERSATION_START_FIRST = 'Conversation Start (1st)'
    const CONVERSATION_START_ANY = 'Conversation Start (Any)'

    function handleRowDeletion(comparison, comparisonModel, originalComparisonModel) {
        const NEW_QUERY = 'NEW_QUERY';
        const OR = 'OR';

        const comparisonModelCopy = [...comparisonModel];
        const {
            comparisonType
        } = comparison;

        switch (comparisonType) {
            case OR: {
                comparisonModel.splice(comparisonModelCopy.indexOf(comparison), 1);
                if (comparisonModelCopy.indexOf(comparison) === comparisonModelCopy.length - 1) {
                    const secondToLastCondition = {
                        ...comparisonModelCopy[comparisonModelCopy.length - 2]
                    };
                    secondToLastCondition.hideOrButton = false;
                    comparisonModel[comparisonModelCopy.length - 2] = secondToLastCondition;
                }
                break;
            }

            default: {
                const length = comparisonModelCopy.length;
                if (length > 1) {
                    comparisonModel.splice(0, 1);
                    comparisonModel[0].comparisonType = comparisonType;
                } else {
                    if (comparisonType === NEW_QUERY) {
                        const updatedComparison = {
                            ...comparison
                        };
                        updatedComparison.field = {
                            ...comparison.field,
                            display: '',
                            internal: '',
                            type: ''
                        };
                        updatedComparison.operator = {
                            display: '',
                            internal: '',
                            meta: {}
                        };
                        updatedComparison.conditionValue = {
                            internal: '',
                            display: ''
                        };
                        updatedComparison.children = [];
                        comparisonModel[comparisonModelCopy.indexOf(comparison)] = updatedComparison;
                    } else {
                        const parentComparison = getParentComparison(comparison.id, originalComparisonModel);
                        parentComparison.conditionValue.meta = {
                            ...parentComparison.conditionValue.meta,
                            canShowCustomOptions: true
                        };
                        comparisonModel.splice(0, comparisonModel.length);

                    }
                }
            }
        }
    }

    const rowDeleted = (rowDeletePayload, comparisonModel) => {
        const {
            comparisonIds = []
        } = rowDeletePayload;
        const comparisonId = comparisonIds[0];
        findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison, localComparisonModel) => {
            handleRowDeletion(comparison, localComparisonModel, comparisonModel);
        });
        return [ ...comparisonModel ];
    }

    const getNewComparisonModel = () => {
        return [
            {
                id: guid(),
                comparisonType: 'NEW_QUERY',
                field: {
                    display: '',
                    internal: '',
                    type: '',
                },
                operator: {
                    display: '',
                    internal: '',
                    meta: {},
                },
                conditionValue: {
                    display: '',
                    internal: '',
                },
                tableName: 'va_funnel',
                updateState: true,
                hideAndButton: true,
                children: [],
            },
        ]
    }

    const flattenSteps = (steps) => {
        const isChildRowNotEmpty = (comparison) => {
            if (!(comparison.children && comparison.children.length > 0))
                return false;

            const {conditionValue, field} = comparison.children[0];

            return conditionValue.internal && field.internal;
        }
        return steps.map(step => {
            const { comparisonModel } = step;
            const vaComparisonModel = comparisonModel.map(comparison => {
                let updatedComparison = comparison;
                const { field, conditionValue } = comparison;
                if (field.internal.indexOf(TOPIC) > -1) {
                    // Topic with topicNode, send as ScreenView
                    if (isChildRowNotEmpty(comparison)) {
                        const childRow = comparison.children[0];
                        let screenName;
                        try{
                            screenName = JSON.parse(JSON.parse(childRow.conditionValue.internal)[0]).screenName;
                        } catch (e) {
                            return updatedComparison
                        }

                        updatedComparison = {
                            ...comparison,
                            field: {
                                internal: TOPIC_NODE,
                                type: 'screen'
                            },
                            conditionValue: {
                                internal: screenName
                            },
                            children: []
                        }
                    } else {
                        // Topic without topicnode, send as Event trigger
                        updatedComparison = {
                            ...comparison,
                            field: {
                                ...field,
                                internal: TOPIC,
                                type: 'screen'
                            },
                            conditionValue: {
                                ...conditionValue,
                                internal: conditionValue.display
                            }
                        }
                    }
                }
                return updatedComparison;
            });
            return {
                ...step,
                comparisonModel: vaComparisonModel
            }
        })
    }

    const getMinifiedFunnelData = (data) => {
        const createMinifiedComparison = (comparison) => {
            const {field, conditionValue} = comparison;
            let value = conditionValue.internal;
            if (field.type === CHOICE_SINGLE_SELECT) {
                value = JSON.parse(conditionValue.internal)[0];
            }

            return {
                field: field.internal,
                conditionValue: value,
                children: []
            }
        }
        const steps = JSON.parse(JSON.stringify(data));
        const flattenedSteps = flattenSteps(steps);
        return flattenedSteps.map(step => {
            const {stepNo, comparisonModel} = step;
            const vaComparisonModel = comparisonModel.map(comparison => {
                const model = createMinifiedComparison(comparison);
                if (comparison.children && comparison.children.length > 0)
                    model.children = comparison.children.map(child => createMinifiedComparison(child));

                return model;
            })
            return {
                "StepNumber": stepNo,
                "VAComparisonModel": vaComparisonModel
            }
        });
    };

    const validateDuplicateSteps = (steps) => {
        steps = getMinifiedFunnelData(steps).map(step => {
            return {
                StepNumber: step['StepNumber'],
                ComparisonModelString: JSON.stringify(step['VAComparisonModel'])
            }
        })
        for (let i = 0; i < steps.length; i++) {
            for (let j= i + 1; j < steps.length; j++) {
                if (steps[i].ComparisonModelString === steps[j].ComparisonModelString) {
                    return {
                        success: false,
                        steps: [steps[i]['StepNumber'], steps[j]['StepNumber']]
                    }
                }
            }
        }
        return {
            success: true
        }
    }

    return {
        getUpdatedComparisonModel: function () {
            const operation = arguments[0]
            const params = [...arguments]
            params.splice(0, 1)
            switch (operation) {
                case 'ROW_DELETED':
                    return rowDeleted(...params)
            }
        },
        getNewComparisonModel: getNewComparisonModel,
        getMinifiedFunnelData: getMinifiedFunnelData,
        validateDuplicateSteps: validateDuplicateSteps
    }
}
