function include({
    imports
}, api = {}, event = {}, helpers = {}) {

    const guid = () => {
        const x = 2147483648;
        return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ Date.now()).toString(36);
    }

    //TODO: Create a constants client script include

    const conditionBuilderStaticChoiceValueFields = {
        'Setup Topic Types': [
            'Anything else',
            'Live agent',
            'Error',
            'Greeting',
            'Closing',
            'Survey',
            'AI Search fallback',
            'Fallback',
            'Explore help'
        ],
        'Type': [
            'VA Only',
            'LA Only',
            'VA to LA',
            'Never Engaged'
        ]
    };
    const OPERATOR_TYPE = {
        js_boolean: 'Boolean',
        js_object: 'Object',
        js_array: 'Array',
        js_integer: 'Number',
        js_string: 'String',
    };
    const findComparisonAndExecuteCallback = (comparisonId, comparisonModel, callbackFunc) => {
        for (let i in comparisonModel) {
            if (comparisonModel[i].id === comparisonId) {
                callbackFunc(comparisonModel[i], comparisonModel);
                return true;
            }
            if (comparisonModel[i].children.length) {
                const found = findComparisonAndExecuteCallback(
                    comparisonId,
                    comparisonModel[i].children,
                    callbackFunc
                );
                if (found) {
                    return true;
                }
            }
        }
    };

    const handleOperatorChange = (comparison, operatorMeta) => {
        // Only update operator when internal and display have changed
        if (comparison.operator.internal === operatorMeta[0].internal) {
            return;
        }
        comparison.operator = {
            ...comparison.operator,
            internal: operatorMeta[0].internal,
            display: operatorMeta[0].display
        };
        comparison.conditionValue = {
            ...comparison.conditionValue,
            internal: '',
            display: '',
            displayParts: [],
            isInvalid: false,
            isInvalidType: false
        };
        comparison.children = [];
    };
    
    const getDisplayValueForGlideDuration = (internalValue, localisedValues) => {
        const { getFormattedTime } = imports['sn_ci_analytics.VADasboardUtils']();
        const displayValues = internalValue.split('@');
        return displayValues.map(value => getFormattedTime(value, localisedValues));
    };

    const handleUpdatedConditionValue = (comparison, updatedValuePayload, localisedValues) => {
        switch (updatedValuePayload.fieldType) {
            case 'integer': {
                if (updatedValuePayload.operator === 'between') {
                    comparison.conditionValue = {
                        internal: updatedValuePayload.newValue,
                        display: updatedValuePayload.newValue.split('@')
                    };
                } else {
                    comparison.conditionValue = {
                        display: updatedValuePayload.newValue,
                        internal: updatedValuePayload.newValue
                    };
                }
                break;
            }

            case 'boolean':
            case 'boolean_is_any': {
                comparison.conditionValue = {
                    displayParts: [updatedValuePayload.newValue],
                    display: updatedValuePayload.newValue,
                    internal: updatedValuePayload.newValue
                };
                break;
            }

            case 'glide_duration': {
                if (updatedValuePayload.operator === 'between') {
                    comparison.conditionValue = {
                        display: getDisplayValueForGlideDuration(updatedValuePayload.newValue, localisedValues),
                        internal: updatedValuePayload.newValue
                    };
                } else {
                    comparison.conditionValue = {
                        display: updatedValuePayload.displayValueMutated,
                        internal: updatedValuePayload.newValue
                    };
                }
                break;
            }

            case 'is_choice':
            case 'contains_choice':
            case 'choice_single_select':
            case 'contains_parent_topic_choice': {
                comparison.conditionValue = {
                    ...comparison.conditionValue,
                    internal: updatedValuePayload.newValue.length ? JSON.stringify(updatedValuePayload.newValue) : '',
                    display: updatedValuePayload.displayValueMutated
                };
                if (updatedValuePayload.newValue.length > 1 || updatedValuePayload.newValue.length === 0) {
                    comparison.children = [];
                    comparison.conditionValue.meta = {
                        ...comparison.conditionValue.meta,
                        canShowCustomOptions: false
                    }
                }

                if (updatedValuePayload.newValue.length === 1 && comparison.children.length === 0) {
                    comparison.conditionValue.meta = {
                        ...comparison.conditionValue.meta,
                        canShowCustomOptions: true
                    }
                    if (comparison.tableName === 'topic_filters' && comparison.field.internal === 'Topic Nodes') {
                        const internalValue = JSON.parse(updatedValuePayload.newValue[0]);
                        // Only show topic node refine properties if nodeType is boolean/choice
                        if (!internalValue.nodeType) {
                            comparison.conditionValue.meta.canShowCustomOptions = false
                        }
                    }
                }
                break;
            }

            case 'glide_date_time': {
                comparison.conditionValue = {
                    ...comparison.conditionValue,
                    internal: updatedValuePayload.newValue,
                    displayParts: updatedValuePayload.displayParts,
                    display: updatedValuePayload.displayParts
                };
                if (updatedValuePayload.operator === 'is in the last') {
                    comparison.conditionValue = {
                        ...comparison.conditionValue,
                        display: updatedValuePayload.displayValueMutated,
                        displayParts: []
                    };
                }
                break;
            }

            case 'string':
            case 'string_eq':
            case 'string_anonymous': {
                comparison.conditionValue = {
                    ...comparison.conditionValue,
                    internal: updatedValuePayload.newValue
                };
                break;
            }
        }
        comparison.conditionValue = {
            ...comparison.conditionValue,
            isInvalid: false,
            isInvalidType: false
        }
    };

    const handleFieldUpdate = (comparison, fieldUpdateProps, fieldOperatorRelationships) => {
        const {
            selectedFieldData,
            pathData,
            displayValue,
            customOptionsMeta,
            newPath
        } = fieldUpdateProps;
        if (comparison.field.internal === fieldUpdateProps.newPath) {
            return;
        }
        const type = selectedFieldData.type;
        comparison.field = {
            ...comparison.field,
            display: displayValue,
            internal: newPath,
            type: type,
            pathData: pathData,
            isInvalid: false
        };
        comparison.children = [];
        comparison.operator = {
            ...comparison.operator,
            ...getDefaultOperator(type, fieldOperatorRelationships)
        };
        comparison.conditionValue = {
            ...comparison.conditionValue,
            internal: '',
            displayParts: [],
            display: '',
            meta: {
                customOptions: getCustomFilterMeta(pathData.path[0].fieldName, selectedFieldData.parent)
            },
            isInvalid: false,
            isInvalidType: false
        }

        if (comparison.tableName === 'va_users' && selectedFieldData.field === 'Conversation Exists') {
            comparison.children.push({
                id: guid(),
                comparisonType: 'IN_WHICH',
                field: {
                    display: 'Conversation Time',
                    internal: 'Conversation Time',
                    type: 'glide_date_time'
                },
                operator: getDefaultOperator('glide_date_time', fieldOperatorRelationships),
                conditionValue: {
                    display: '',
                    internal: ''
                },
                hideOrButton: false,
                hideAndButton: false,
                tableName: 'va_conversations',
                children: []
            });
        }
    };

    const handleAndRowAddition = (comparison, comparisonModel) => {
        comparison.hideAndButton = true;
        comparison.hideOrButton = true;
        comparisonModel.push({
            id: guid(),
            comparisonType: 'AND',
            field: {
                display: '',
                internal: '',
                type: ''
            },
            operator: {
                display: '',
                internal: '',
                meta: {}
            },
            conditionValue: {
                display: '',
                internal: ''
            },
            hideOrButton: true,
            tableName: comparison.tableName,
            children: []
        });
    };

    const handleOrRowAddition = (comparison, comparisonModel) => {
        comparison.hideAndButton = true;
        comparison.hideOrButton = true;
        comparisonModel.push({
            id: guid(),
            comparisonType: 'OR',
            field: {
                display: '',
                internal: '',
                type: ''
            },
            operator: {
                display: '',
                internal: '',
                meta: {}
            },
            conditionValue: {
                display: '',
                internal: ''
            },
            hideAndButton: true,
            tableName: comparison.tableName,
            children: []
        });
    };

    const handleChoiceValueUpdation = (comparison, choices) => {
        let choiceList = [];
        /*
         * The choices output is variable for different endpoints.
         * Some endpoints return array. some return object with key value pairs.
         */
        if (Array.isArray(choices)) {
            if (typeof choices[0] === 'string') {
                choiceList = choices.map(choice => ({
                    id: choice,
                    label: choice
                }));
            } else {
                choiceList = choices;
            }
        } else {
            for (var key in choices) {
                choiceList.push({
                    id: key,
                    label: choices[key]
                });
            }
        }

        comparison.conditionValue = {
            ...comparison.conditionValue,
            displayParts: choiceList,
            choiceListLoading: false
        };
    }

    const getAppseeRequestPayload = (comparisonId, fieldInternalValue, tableName, comparisonModel) => {
        switch (tableName) {
            case 'va_conversations':
            case 'va_users':
            case 'va_funnel': {
                switch (fieldInternalValue) {
                    case 'End State':
                    case 'Feedback Result':
                    case 'Provider Name': {
                        return {
                            dynamic_property_name: fieldInternalValue
                        };
                    }

                    case 'Channel':
                    case 'Channels': {
                        return {
                            dynamic_property_name: 'Channel Name'
                        };
                    }

                    case 'Events': {
                        return {
                            event_type_filter: 'Custom'
                        };
                    }

                    case 'Topic Categories': {
                        return {
                            event_type_filter: 'Topic Category'
                        }
                    }

                    case 'Topic Blocks': {
                        return {
                            event_property_name: 'Parent Topic Name',
                            event_type: 'Topic',
                            valueTransformer: (data) => {
                                return Object.keys(data);
                            }
                        }
                    }

                    case 'Language': {
                        return {
                            language: true
                        }
                    }
                    // Funnel fields
                    case 'Event Trigger': {
                        return {
                            event_type_filter: 'Custom'
                        };
                    }
                    case 'Topic': {
                        return {
                            screen_type: '3',
                            platform: '3',
                            valueTransformer: (data) => {
                                return data.map(topic => ({
                                    id: topic.Name,
                                    label: topic.DisplayName
                                }));
                            }
                        }
                    }


                    case 'Topics': {
                        return {
                            platform: '3',
                            screen_type: '3',
                            valueTransformer: (data) => {
                                return data.map(topic => ({
                                    id: topic.DisplayName,
                                    label: topic.DisplayName
                                }));
                            }
                        }
                    }
                }
                break;
            }

            case 'topic_sub_categories': {
                return {
                    event_property_name: 'Sub Category',
                    event_type: 'Topic',
                    tableName,
                    fieldInternalValue: fieldInternalValue.split('.')[1]
                }
            }

            case 'topic_nodes': {
                return {
                    screen_type: '4',
                    platform: '3'
                }
            }

            case 'topic_filters': {
                const parentRow = getParentComparison(comparisonId, comparisonModel);
                const topicName = JSON.parse(parentRow.conditionValue.internal)[0];
                return {
                    screen_type: '4',
                    platform: '3',
                    topicName
                };
            }

            case 'topic_filters_funnel': {
                const parentRow = getParentComparison(comparisonId, comparisonModel);
                const payload = {
                    screen_type: '4',
                    platform: '3',
                }
                const screenId = JSON.parse(parentRow.conditionValue.internal)[0];
                const option = parentRow.conditionValue.displayParts[0];
                if (option && option.id === option.label) { // Topic as event
                    payload['topicName'] = screenId;
                } else { // Topic as screen
                    payload['screenId'] = screenId;
                }

                return payload;
            }

            case 'topic_node_filter': {
                const topicNodeComparisonRow = getParentComparison(comparisonId, comparisonModel);
                const topicNodeId = JSON.parse(JSON.parse(topicNodeComparisonRow.conditionValue.internal)).screenName.split('/')[1];
                const topicNodeName = topicNodeComparisonRow.conditionValue.display;
                return {
                    event_property_name: 'Selected Value',
                    event_type: 'Topic Node',
                    tableName,
                    fieldInternalValue: fieldInternalValue.split('.')[1],
                    nodeType: 'choice',
                    topicNodeId,
                    topicNodeName
                };
            }
        }
    }

    const handleFilterPropertiesClick = (comparison, tableName, fieldInternalValue, dotWalkMetadata, fieldOperatorRelationships) => {
        const childComparisonModel = {
            id: guid(),
            comparisonType: 'THAT_HAS',
            field: {
                display: '',
                internal: '',
                type: ''
            },
            operator: {
                display: '',
                internal: '',
                meta: {}
            },
            conditionValue: {
                display: '',
                internal: ''
            },
            hideOrButton: true,
            hideAndButton: true,
            children: [],
            tableName: 'topic_filters'
        };
        switch (tableName) {
            case 'va_funnel':
                if (fieldInternalValue === 'Topic') {
                    const tableName = 'topic_filters_funnel';
                    const childFieldInternalValue = 'Topic Nodes'
                    const childFieldDisplayValue = dotWalkMetadata[tableName][childFieldInternalValue].displayValue;
                    const editorType = dotWalkMetadata[tableName][childFieldInternalValue].type;

                    childComparisonModel.tableName = tableName;
                    childComparisonModel.comparisonType = 'IN_WHICH';
                    childComparisonModel.field = {
                        ...childComparisonModel.field,
                        internal: childFieldInternalValue,
                        display: childFieldDisplayValue,
                        type: editorType,
                        pathData: {
                            dotwalkMode: 'TABLE_FIELDS',
                            path: [{
                                fieldLabel: childFieldDisplayValue,
                                fieldName: childFieldInternalValue,
                                table: tableName,
                                type: editorType
                            }]
                        }
                    }
                    childComparisonModel.operator = {
                        ...comparison.operator,
                        ...getDefaultOperator(editorType, fieldOperatorRelationships)
                    };
                    comparison.children.push(childComparisonModel);
                    comparison.conditionValue.meta = {
                        ...comparison.conditionValue.meta,
                        canShowCustomOptions: false
                    }
                }
                break;
            case 'topic_sub_categories': {
                comparison.children.push(childComparisonModel);
                comparison.conditionValue.meta = {
                    ...comparison.conditionValue.meta,
                    canShowCustomOptions: false
                }
                break;
            }

            case 'topic_filters': {
                if (fieldInternalValue === 'Topic Nodes') {
                    const nodeType = JSON.parse(JSON.parse(comparison.conditionValue.internal)).nodeType;
                    const editorType = 'choice_single_select';
                    const tableName = 'topic_node_filter';
                    const childFieldInternalValue = 'Selected Value'
                    const childFieldDisplayValue = dotWalkMetadata[tableName][childFieldInternalValue].displayValue;
                    childComparisonModel.field = {
                        ...childComparisonModel.field,
                        internal: childFieldInternalValue,
                        display: childFieldDisplayValue,
                        type: editorType,
                        pathData: {
                            dotwalkMode: 'TABLE_FIELDS',
                            path: [{
                                fieldLabel: childFieldDisplayValue,
                                fieldName: childFieldInternalValue,
                                table: tableName,
                                type: editorType
                            }]
                        }
                    }
                    childComparisonModel.tableName = 'topic_node_filter';
                    childComparisonModel.operator = {
                        ...comparison.operator,
                        ...getDefaultOperator(editorType, fieldOperatorRelationships)
                    };
                    comparison.children.push(childComparisonModel);
                    comparison.conditionValue.meta = {
                        ...comparison.conditionValue.meta,
                        canShowCustomOptions: false
                    }
                }
                break;
            }

            case 'va_conversations': {
                if (comparison.field.internal === 'Topics') {
                    comparison.children.push(childComparisonModel);
                    comparison.conditionValue.meta = {
                        ...comparison.conditionValue.meta,
                        canShowCustomOptions: false
                    }
                }
                break;
            }
        }
    }

    const handleRowDeletion = (comparison, comparisonModel, rootComparisonModel) => {
        const NEW_QUERY = 'NEW_QUERY';
        const AND = 'AND';
        const OR = 'OR';
        const {
            comparisonType
        } = comparison;

        switch (comparisonType) {
            case AND:
            case OR: {
                if (comparisonModel.indexOf(comparison) === comparisonModel.length - 1) {
                    const secondToLastCondition = {
                        ...comparisonModel[comparisonModel.length - 2]
                    };
                    switch (secondToLastCondition.comparisonType) {
                        case AND: {
                            secondToLastCondition.hideAndButton = false;
                            break;
                        }
                        case OR: {
                            secondToLastCondition.hideOrButton = false;
                            break;
                        }
                        default: {
                            secondToLastCondition.hideAndButton = false;
                            secondToLastCondition.hideOrButton = false;
                            break;
                        }
                    }
                    comparisonModel[comparisonModel.length - 2] = secondToLastCondition;
                }
                comparisonModel.splice(comparisonModel.indexOf(comparison), 1);
                break;
            }

            default: {
                const length = comparisonModel.length;
                if (length > 1) {
                    comparisonModel[1].comparisonType = comparisonType;
                    if (length === 2) {
                        comparisonModel[1].hideAndButton = false;
                        comparisonModel[1].hideOrButton = false;
                    }
                    comparisonModel.splice(0, 1);
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
                        comparisonModel[comparisonModel.indexOf(comparison)] = updatedComparison;
                    } else {
                        const parentComparison = getParentComparison(comparison.id, rootComparisonModel);
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

    const addChildRow = (comparison, childRowTable, childRowComparisonType) => {
        comparison.children.push({
            id: guid(),
            comparisonType: childRowComparisonType,
            field: {
                display: '',
                internal: '',
                type: ''
            },
            operator: {
                display: '',
                internal: '',
                meta: {}
            },
            conditionValue: {
                display: '',
                internal: ''
            },
            hideOrButton: false,
            hideAndButton: false,
            children: [],
            tableName: childRowTable
        });
        comparison.conditionValue.meta = {
            ...comparison.conditionValue.meta,
            canShowCustomOptions: false
        }
    }

    const comparisonRowFieldUpdated = (updatedFieldPayload, comparisonModel, fieldOperatorRelationships) => {
        findComparisonAndExecuteCallback(updatedFieldPayload.comparisonId, comparisonModel, (comparison) => {
            handleFieldUpdate(comparison, updatedFieldPayload, fieldOperatorRelationships);
        });
        return [...comparisonModel];
    }

    const comparisonRowValueUpdated = (updatedValuePayload, comparisonModel, localisedValues) => {
        findComparisonAndExecuteCallback(updatedValuePayload.comparisonId, comparisonModel, (comparison) => {
            handleUpdatedConditionValue(comparison, updatedValuePayload, localisedValues);
        });
        return [...comparisonModel];
    }

    const comparisonRowOrClicked = (comparisonId, comparisonModel) => {
        findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison, localComparisonModel) => {
            handleOrRowAddition(comparison, localComparisonModel)
        });
        return [...comparisonModel];
    }

    const comparisonRowAndClicked = (comparisonId, comparisonModel) => {
        findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison, localComparisonModel) => {
            handleAndRowAddition(comparison, localComparisonModel)
        });
        return [...comparisonModel];
    }

    const comparisonRowFieldMetaRequested = (actionPayload, comparisonModel) => {
        const {
            tables,
            comparisonId
        } = actionPayload;
        let tableName = tables[tables.length - 1];

        let fetchChoiceValuesPayload = {
            tableName,
            source: 'dot_walk_meta_requested'
        };

        if (tableName.includes('event_properties')) {
            tableName = 'event_properties';
        }

        switch (tableName) {
            case 'topic_sub_categories': {
                fetchChoiceValuesPayload.event_property_name = 'Sub Category';
                fetchChoiceValuesPayload.event_type = 'Topic';
                fetchChoiceValuesPayload.tableName = tableName;
                fetchChoiceValuesPayload.valueTransformer = (data) => {
                    return Object.keys(data);
                };
                break;
            }

            case 'topic_nodes': {
                fetchChoiceValuesPayload.platform = '3';
                fetchChoiceValuesPayload.screen_type = '3';
                fetchChoiceValuesPayload.valueTransformer = function(data) {
                    let options = data.map(topic => {
                        return {
                            Key: topic.Name,
                            Value: topic.DisplayName
                        };
                    });
                    return options;
                };
                break;
            }

            case 'event_properties': {
                const parentComparisonRow = getParentComparison(comparisonId, comparisonModel);
                fetchChoiceValuesPayload.event_name = JSON.parse(parentComparisonRow.conditionValue.internal)[0];
                break;
            }
        }
        return fetchChoiceValuesPayload;
    }

    const comparisonRowStaticFilterPropertiesClicked = (actionPayload, comparisonModel, source, dotWalkMetadata, fieldOperatorRelationships) => {
        const {
            comparisonId,
            tableName,
            fieldInternalValue
        } = actionPayload;

        findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison) => {
            const isFunnel = source && source === 'va_funnel'
            const table = isFunnel ? 'va_funnel' : tableName;
            const internalValue = isFunnel && fieldInternalValue.indexOf('Topic') > -1
                ? 'Topic' : fieldInternalValue;
            handleFilterPropertiesClick(comparison, table, internalValue, dotWalkMetadata, fieldOperatorRelationships);
        });
        return [...comparisonModel];
    }

    const comparisonRowStaticChoiceInputClicked = (choicePayload, comparisonModel) => {
        const {
            comparisonId,
            valueFieldLabel: {
                fieldInternalValue
            }
        } = choicePayload;
        const comparisonModelCopy = [...comparisonModel];
        const condition = comparisonModelCopy.filter(cmp => cmp.id === comparisonId).pop();
        const updatedCondition = {
            ...condition
        };
        const choices = conditionBuilderStaticChoiceValueFields[fieldInternalValue];
        let choiceList = choices.map(choice => ({
            id: choice,
            label: choice
        }));
        updatedCondition.conditionValue = {
            ...condition.conditionValue,
            displayParts: choiceList
        };
        comparisonModelCopy[comparisonModelCopy.indexOf(condition)] = updatedCondition;
        return comparisonModelCopy;
    }

    const comparisonRowOperatorChanged = (updatedOperatorPayload, comparisonModel) => {
        findComparisonAndExecuteCallback(updatedOperatorPayload.comparisonId, comparisonModel, (comparison) => {
            handleOperatorChange(comparison, updatedOperatorPayload.operatorMeta);
        });
        return [...comparisonModel];
    }

    const comparisonRowDeleteClicked = (rowDeletePayload, comparisonModel) => {
        const {
            comparisonIds = []
        } = rowDeletePayload;
        const comparisonId = comparisonIds[0];
        findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison, localComparisonModel) => {
            handleRowDeletion(comparison, localComparisonModel, comparisonModel);
        });
        return [...comparisonModel];
    }

    /*
    	Appsee does not understand conditions in now-condition-builder acceptable format.
    	Hence we transform comparisonModel to an appsee acceptable query. The transformation script needs
    	minimal amount of information from the comparisonModel like the internal/display values of each
    	field-value-operator combination and this method returns just that.
     */
    const createMinifiedComparisonModel = (comparisonModel) => {
        const minifiedComparisonModel = [];
        for (var i in comparisonModel) {
            const comparison = comparisonModel[i];
            let comparisonObj = {
                field: comparison.field.internal,
                operator: {
                    type: null,
                    internal_value: comparison.operator.internal
                },
                comparisonType: comparison.comparisonType,
                children: []
            };

            switch (comparison.field.type) {
                case 'boolean':
                case 'boolean_is_any': {
                    comparisonObj.conditionValue = comparison.conditionValue.internal;
                    comparisonObj.operator.type = OPERATOR_TYPE.js_boolean;
                    break;
                }

                case 'glide_duration': {
                    const referenceDate = new Date('1970-01-01 00:00:00');
                    if (comparison.operator.internal === 'between') {
                        comparisonObj.operator.internal_value = 'is between';
                        const durationRange = comparison.conditionValue.internal.split('@');
                        const lowerLimitDate = new Date(durationRange[0]);
                        const upperLimitDate = new Date(durationRange[1]);
                        comparisonObj.conditionValue = [
                            lowerLimitDate.getTime() - referenceDate.getTime(),
                            upperLimitDate.getTime() - referenceDate.getTime()
                        ];
                        comparisonObj.operator.type = OPERATOR_TYPE.js_object;
                    } else {
                        const date = new Date(comparison.conditionValue.internal);
                        const diff = (date.getTime() - referenceDate.getTime());
                        comparisonObj.conditionValue = diff;
                        comparisonObj.operator.type = OPERATOR_TYPE.js_integer;
                    }
                    break;
                }

                case 'is_choice':
                case 'contains_choice':
                case 'choice_single_select':
                case 'contains_parent_topic_choice': {
                    const fieldInternalValue = comparison.field.internal;
                    const tableName = comparison.tableName;
                    if (comparison.field.pathData.path[0].fieldName === 'Topics') {
                        comparisonObj.field = 'Topics'
                    }
                    const parsedValue = JSON.parse(comparison.conditionValue.internal);
                    if (fieldInternalValue === 'Topic Nodes') {
                        for (let i in parsedValue) {
                            parsedValue[i] = JSON.parse(parsedValue[i]);
                        }
                        comparisonObj.conditionValue = {
                            appId: parsedValue[0].appId,
                            platform: parsedValue[0].platform,
                            screenName: [],
                            nodeType: parsedValue[0].nodeType
                        };
                        for (let i in parsedValue) {
                            comparisonObj.conditionValue.screenName.push(parsedValue[i].screenName);
                        }
                    } else if (fieldInternalValue === 'Selected Value' && tableName === 'topic_node_filter') {
                        try{
                            const internalValue = JSON.parse(parsedValue[0]);
                            comparisonObj.conditionValue = {
                                selected_value: comparison.conditionValue.display,
                                topic_node_id: internalValue.topic_node_id,
                                topic_node_name: internalValue.topic_node_name
                            }
                        }catch(e){
                            comparisonObj.conditionValue = null;
                        }
                    } else if (fieldInternalValue === 'Last Visited Node Name' && tableName === 'topic_filters') {
                        comparisonObj.conditionValue = comparison.conditionValue.display.split(', ');
                    } else {
                        comparisonObj.conditionValue = parsedValue;
                    }
                    comparisonObj.operator.type = comparison.operator.internal === 'is' ? OPERATOR_TYPE.js_string : OPERATOR_TYPE.js_array;
                    break;
                }

                case 'integer': {
                    if (comparison.operator.internal === 'between') {
                        comparisonObj.operator.internal_value = 'is between';
                        const valueRange = comparison.conditionValue.display;
                        comparisonObj.conditionValue = [valueRange[0], valueRange[1]];
                        comparisonObj.operator.type = OPERATOR_TYPE.js_object;
                    } else {
                        comparisonObj.conditionValue = comparison.conditionValue.internal;
                        comparisonObj.operator.type = OPERATOR_TYPE.js_integer;
                    }
                    break;
                }

                case 'glide_date_time':
                    comparisonObj.conditionValue = comparison.conditionValue.internal;
                    comparisonObj.operator.type = OPERATOR_TYPE.js_object;
                    break;
                case 'string': {
                    comparisonObj.conditionValue = comparison.conditionValue.internal;
                    comparisonObj.operator.type = OPERATOR_TYPE.js_string;
                    break;
                }
                case 'string_anonymous': {
                    comparisonObj.conditionValue = comparison.conditionValue.internal;
                    comparisonObj.operator.type = comparisonObj.operator.internal_value == 'is anonymous' ? OPERATOR_TYPE.js_boolean : OPERATOR_TYPE.js_string;
                    break;
                }
                default:
                    comparisonObj.operator.internal_value = 'is';
                    comparisonObj.operator.type = OPERATOR_TYPE.js_string;
            }

            if (comparison.children.length) {
                const childMinifiedComparisonModel = createMinifiedComparisonModel(comparison.children);

                // Return false if child comparison rows have insufficient information.
                if (!childMinifiedComparisonModel) {
                    return false;
                }
                comparisonObj.children = childMinifiedComparisonModel;
            }

            minifiedComparisonModel.push(comparisonObj);
        }

        return minifiedComparisonModel;
    }


    const _isJson = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

     const _getMinifiedComparisonModel = function(comparisonModel) {
        var minifiedComparisonModel = [];
        comparisonModel.forEach(function(comparison) {
            var fieldType = comparison.field.type;
            var conditionValue = comparison.conditionValue.internal;
            conditionValue = _isJson(conditionValue) && fieldType !== 'boolean' ? JSON.parse(conditionValue) : conditionValue;
            minifiedComparisonModel.push({
                comparisonType: comparison.comparisonType,
                field: comparison.field.internal,
                operator: comparison.operator.internal,
                conditionValue: conditionValue,
                tableName: comparison.tableName,
                hideAndButton: comparison.hideAndButton,
                hideOrButton: comparison.hideOrButton,
                children: _getMinifiedComparisonModel(comparison.children)
            });
        });
        return minifiedComparisonModel;
    }

    /**
     * When saving conditions, instead of putting the entire comparisonModel JSON in records we
     * store only the minimum necessary information using which we can rebuild the comparisonModel 
     * later while reloading.
     */

     const getMinifiedComparisonModel = function(comparisonModel) {
         try{
            return _getMinifiedComparisonModel(comparisonModel);
         }catch{
             return [];
         }
     }

    const isIntegerValue = (value) => {
        return /^\d+$/.test(value)
    }

    const validateComparisonRowInput = (comparisonRow) => {
        let isFieldValid = false, isConditionValueValid = false, isConditionValueTypeValid = true;
        const {
            field,
            operator,
            conditionValue
        } = comparisonRow;

        // Validate field based on internal value
        if (field.internal) {
            isFieldValid = true;
        } else {
            comparisonRow.field = {
                ...field,
                isInvalid: true
            }
        }

        if ((!operator.internal && !field.type) || (operator.internal && conditionValue.internal)) {
            // Field type is empty for fields which have no operators like Conversation Exists
            isConditionValueValid = true;
        } else if (operator.internal && !conditionValue.internal) {
            /** 
             * boolean_is_any is the only field type where operator exists but 
             * there is no conditionValue to be selected. Matching by field type and operator
             * internal value is the only validation that can confirm this.
            */
            if (field.type === 'boolean_is_any' && operator.internal === 'is anything') {
                isConditionValueValid = true;
            } else {
                comparisonRow.conditionValue = {
                    ...conditionValue,
                    isInvalid: true
                }
            }
        }

        // Extra validation for integer inputs since now-condition-builder is not doing it.
        if (isConditionValueValid && field.type === 'integer') {
            const displayParts = conditionValue.internal.split('@');
            for (const displayPart of displayParts) {
                if (!isIntegerValue(displayPart)) {
                    isConditionValueTypeValid = false;
                    comparisonRow.conditionValue = {
                        ...conditionValue,
                        isInvalidType: true
                    }
                    break;
                }
            }
        }

        return isFieldValid && isConditionValueValid && isConditionValueTypeValid;
    }

    /**
     * Validates comparisonModel for empty field and condition inputs.
     * Returns true if all inputs are valid, false otherwise. Also updates the
     * comparisonModel meta inplace with validation information.
     */
    const validateConditionBuilderInputs = (comparisonModel) => {
        let isInputValid = false;
        for (let i = 0; i < comparisonModel.length; ++i) {
            const areComparisonInputsValid = validateComparisonRowInput(comparisonModel[i]);
            isInputValid = i === 0 ? areComparisonInputsValid : isInputValid && areComparisonInputsValid;
            const children = comparisonModel[i].children;
            if (children.length) {
                isInputValid = isInputValid && validateConditionBuilderInputs(children);
            }
        }
        return isInputValid;
    }

    const conditionBuilderRunClicked = (comparisonModel) => {
        return JSON.stringify(createMinifiedComparisonModel(comparisonModel));
    }

    const getDefaultOperator = (fieldType, fieldOperatorRelationships) => {
        const fieldToOperatorMapping = fieldOperatorRelationships[fieldType];
        const operators = fieldToOperatorMapping ? fieldToOperatorMapping.operators : [];
        if (operators.length) {
            return {
                internal: operators[0].internal,
                display: operators[0].display
            }
        }
        return {
            internal: '',
            display: ''
        }
    }

    const getCustomFilterMeta = (field, tableName) => {
        const getfilterProperty = (linkName) => [{
            'display': linkName,
            'type': 'link',
            'action': 'SN_VA_CONDITION_ROW#FILTER_BY_PROPS'
        }];
        switch (tableName) {
            case 'va_funnel': {
                switch (field) {
                    case 'Event Trigger':
                    case 'Topic':
                        return getfilterProperty('Filter properties');
                    default:
                        return [];
                }
            }
            case 'va_conversations': {
                switch (field) {
                    case 'Events':
                        return getfilterProperty('Filter properties');
                    case 'Topics':
                        return getfilterProperty('Add properties');
                    default:
                        return [];
                }
            }

            case 'topic_sub_categories': {
                return getfilterProperty('Add properties')
            }

            case 'topic_filters': {
                switch (field) {
                    case 'Topic Nodes':
                        return getfilterProperty('Refine properties');
                }
            }
        }
    }

    const getParentComparison = (comparisonId, comparisonModel) => {
        for (let i in comparisonModel) {
            if (comparisonModel[i].children.length) {
                const children = comparisonModel[i].children;
                for (let j in children) {
                    if (children[j].id === comparisonId) {
                        return comparisonModel[i];
                    }
                }

                const searchParentInChildArray = getParentComparison(comparisonId, comparisonModel[i].children);
                if (searchParentInChildArray) {
                    return searchParentInChildArray;
                }
            }
        }
    }

    const updateDotWalkMetadata = (tableName, fieldChoices, dotWalkMetadata, operatorType = 'contains_choice') => {
        switch (tableName) {
            case 'topic_sub_categories': {
                const fields = {};
                fieldChoices.forEach(choice => {
                    fields[choice] = {
                        displayValue: choice,
                        type: operatorType,
                        parent: tableName,
                    };
                });
                return {
                    ...dotWalkMetadata,
                    [tableName]: fields
                };
            }

            case 'topic_nodes': {
                const fields = {};
                fieldChoices.forEach(choice => {
                    fields[choice.Key] = {
                        displayValue: choice.Value,
                        type: operatorType,
                        parent: tableName,
                        internalValue: choice.Key
                    };
                });
                return {
                    ...dotWalkMetadata,
                    [tableName]: fields
                };
            }
        }

        if (tableName.includes('event_properties')) {
            const fields = {};
            fieldChoices.forEach(choice => {
                fields[choice] = {
                    displayValue: choice,
                    type: 'string',
                    parent: tableName,
                };
            });
            return {
                ...dotWalkMetadata,
                [tableName]: fields
            };
        }
    }

    const updateChoiceEditorOptions = (rowComparisonId, comparisonModel, choices) => {
        findComparisonAndExecuteCallback(rowComparisonId, comparisonModel, (comparison) => {
            handleChoiceValueUpdation(comparison, choices);
        });
        return [...comparisonModel];
    }

    const addChildRowWithDynamicFieldChoices = (comparisonId, comparisonModel, fieldInternalValue, parentChoiceValue, fieldChoices, dotWalkMetadata) => {
        switch (fieldInternalValue) {
            case 'Events': {
                const tableName = 'event_properties_' + parentChoiceValue;
                const fields = {};
                fieldChoices.forEach(choice => {
                    fields[choice] = {
                        displayValue: choice,
                        type: 'string',
                        parent: tableName,
                    };
                });
                const updatedDotWalkMetadata = {
                    ...dotWalkMetadata,
                    [tableName]: fields
                };
                findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison) => {
                    addChildRow(comparison, tableName, 'IN_WHICH');
                });
                return {
                    comparisonModel: [...comparisonModel],
                    dotWalkMetadata: updatedDotWalkMetadata
                }
            }

            case 'Event Trigger': {
                const tableName = 'event_properties_funnel_' + parentChoiceValue;
                const fields = {};
                fieldChoices.forEach(choice => {
                    fields[choice] = {
                        displayValue: choice,
                        type: 'string_eq',
                        parent: tableName,
                    };
                });
                const updatedDotWalkMetadata = {
                    ...dotWalkMetadata,
                    [tableName]: fields
                };
                findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison) => {
                    addChildRow(comparison, tableName, 'IN_WHICH');
                    let childRow = comparison.children[comparison.children.length - 1];
                    childRow.hideAndButton = true;
                });
                return {
                    comparisonModel: [...comparisonModel],
                    dotWalkMetadata: updatedDotWalkMetadata
                }
            }

        }
    }

    const handleChoiceEditorLoadingState = (comparison, isLoading = true) => {
        comparison.conditionValue = {
            ...comparison.conditionValue,
            choiceListLoading: isLoading
        }
    }

    const setChoiceEditorLoadingState = (comparisonId, comparisonModel) => {
        findComparisonAndExecuteCallback(comparisonId, comparisonModel, (comparison) => {
            handleChoiceEditorLoadingState(comparison);
        });
        return [...comparisonModel];
    }

    return {
        findComparisonAndExecuteCallback: findComparisonAndExecuteCallback,
        comparisonRowFieldUpdated: comparisonRowFieldUpdated,
        comparisonRowValueUpdated: comparisonRowValueUpdated,
        comparisonRowOrClicked: comparisonRowOrClicked,
        comparisonRowAndClicked: comparisonRowAndClicked,
        comparisonRowFieldMetaRequested: comparisonRowFieldMetaRequested,
        comparisonRowFilterPropertiesClicked: comparisonRowStaticFilterPropertiesClicked,
        comparisonRowStaticChoiceInputClicked: comparisonRowStaticChoiceInputClicked,
        comparisonRowOperatorChanged: comparisonRowOperatorChanged,
        comparisonRowDeleteClicked: comparisonRowDeleteClicked,
        conditionBuilderRunClicked: conditionBuilderRunClicked,
        updateDotWalkMetadata: updateDotWalkMetadata,
        updateChoiceEditorOptions: updateChoiceEditorOptions,
        addChildRowWithDynamicFieldChoices: addChildRowWithDynamicFieldChoices,
        getAppseeRequestPayload: getAppseeRequestPayload,
        getParentComparison: getParentComparison,
        getMinifiedComparisonModel: getMinifiedComparisonModel,
        guid: guid,
        setChoiceEditorLoadingState: setChoiceEditorLoadingState,
        validateConditionBuilderInputs: validateConditionBuilderInputs
    };
}
