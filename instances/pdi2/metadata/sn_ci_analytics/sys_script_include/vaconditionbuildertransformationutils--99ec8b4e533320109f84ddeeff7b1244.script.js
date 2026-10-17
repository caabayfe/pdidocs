var VAConditionBuilderTransformationUtils = Class.create();

VAConditionBuilderTransformationUtils.prototype = {
    initialize: function() {
        this.vaConditionBuilderMetadataUtils = new VAConditionBuilderMetadataUtils();
        this.vaConditionBuilderAPIUtils = new VAConditionBuilderAPIUtils();
        this.logger = CIAnalyticsLogger.getLogger("VAConditionBuilderTransformationUtils");
        this.choiceFields = ['is_choice', 'contains_choice', 'contains_parent_topic_choice', 'choice_single_select'];
    },

    /**
     * When saving conditions, instead of putting the entire comparisonModel JSON in records we
     * store only the minimum necessary information using which we can rebuild the comparisonModel 
     * later while reloading.
     */
    getMinifiedComparisonModel: function(comparisonModel) {
        var minifiedComparisonModel = [];
        var self = this;
        comparisonModel.forEach(function(comparison) {
            var fieldType = comparison.field.type;
            var conditionValue = comparison.conditionValue.internal;
            if (self.isJson(conditionValue) && self.isChoiceType(fieldType)) {
                conditionValue = JSON.parse(conditionValue);
            }
            minifiedComparisonModel.push({
                comparisonType: comparison.comparisonType,
                field: comparison.field.internal,
                operator: comparison.operator.internal,
                conditionValue: conditionValue,
                tableName: comparison.tableName,
                hideAndButton: comparison.hideAndButton,
                hideOrButton: comparison.hideOrButton,
                children: self.getMinifiedComparisonModel(comparison.children)
            });
        });
        return minifiedComparisonModel;
    },

    /**
     * @param {string} minifiedComparisonModel - Minified comparisonModel with only the necessary information
     * @param {string} tableName - Primary table to which the query belongs
     * @returns {Array} Returns a comparisonModel with all the required information and metadata that is required by
     * now-condition-builder to render filters.
     */
    getFullScaleComparisonModel: function(minifiedComparisonModel, tableName) {
        return this._getFullScaleComparisonModel(minifiedComparisonModel, null, tableName, tableName, null);
    },

    _getFullScaleComparisonModel: function(minifiedComparisonModel, parentComparisonModel, tableName, baseTableName, parentComparison) {
        var comparisonModel = [];
        var choiceValues = {};
        var self = this;
        minifiedComparisonModel.forEach(function(minifiedComparison) {
            var fieldInternalValue = minifiedComparison.field;
            var comparisonId = self.guid();
            minifiedComparison.id = comparisonId;
            var computedTableName = minifiedComparison.tableName || tableName || self._buildTableName(baseTableName, minifiedComparison, parentComparison); //to support the case where minified model has tableName
            var fieldObject = self.getFieldObject(fieldInternalValue, computedTableName, comparisonId, parentComparisonModel);
            var pathLength = fieldObject.pathData.path.length;
            var leafTableName = fieldObject.pathData.path[pathLength - 1].table;
            if (self.isChoiceType(fieldObject.type) && !choiceValues[fieldInternalValue]) {
                choiceValues[fieldInternalValue] = self.getPrePopulatedChoiceValues(comparisonId, fieldInternalValue, leafTableName, parentComparisonModel);
            }

            var conditionValue = self.getConditionValueObject(minifiedComparison.conditionValue, fieldObject.type, choiceValues[fieldInternalValue], fieldInternalValue, leafTableName);
            conditionValue['meta']['canShowCustomOptions'] = conditionValue['meta']['canShowCustomOptions'] && minifiedComparison.children.length === 0 ? true : false;

            comparisonModel.push({
                id: comparisonId,
                comparisonType: minifiedComparison.comparisonType,
                field: fieldObject,
                operator: self.getOperatorObject(minifiedComparison.operator, fieldObject.type),
                conditionValue: conditionValue,
                tableName: computedTableName,
                hideAndButton: minifiedComparison.hideAndButton,
                hideOrButton: minifiedComparison.hideOrButton,
                children: self._getFullScaleComparisonModel(minifiedComparison.children, minifiedComparisonModel, null, baseTableName, minifiedComparison)
            });
        });
        return comparisonModel;
    },

    getFieldObject: function(fieldInternalValue, bucketName, comparisonId, parentComparisonModel) {
        /**
         * Field internal value can be in a dotwalked format in which case it looks like:
         * Topics.SETUP_TOPIC
         */
        var fields = fieldInternalValue.split('.');
        var fieldDisplayValue = '',
            path = [];
        for (var i in fields) {
            var fieldType;
            var tableName = i == 0 ? bucketName : path[i - 1].referenceDataKey;
            var fieldMetadata = this.vaConditionBuilderMetadataUtils.getFieldMetadata(fields[i], tableName);
            var displayValue = fieldMetadata ? fieldMetadata['displayValue'] : fields[i];
            // Example: "Topics > TOPIC_BLOCKS". Display of Dot walked fields are separated by '>'.
            fieldDisplayValue += i == 0 ? displayValue : (' > ' + displayValue);

            // fieldMetadataRecord will exist only for static fields like Channel and Favorite.
            // For dynamic fields like Event Properties or Topic SubCat there wont be any field record.
            if (fieldMetadata) {
                fieldType = fieldMetadata['type'];
                var referenceTable = fieldMetadata['referenceDataKey'];
                path.push(this.getFieldPathObject(fields[i], displayValue, fieldType, tableName, referenceTable));
            } else {
                // By default marking root level dynamic fields as type string, eg. Event props
                // TODO: Should we rather save type in minifiedComparisonModel ? Consult!
                fieldType = i == 0 ? 'string' : path[i - 1].type;
                path.push(this.getFieldPathObject(fields[i], fields[i], fieldType, tableName));
            }
        }

        return {
            internal: fieldInternalValue,
            display: fieldDisplayValue,
            type: path.length ? path[path.length - 1].type : '',
            pathData: {
                dotwalkMode: 'TABLE_FIELDS',
                path: path
            }
        };
    },

    getOperatorObject: function(operatorInternalValue, fieldType) {
        return {
            internal: operatorInternalValue,
            display: this.vaConditionBuilderMetadataUtils.getOperatorDisplayValue(operatorInternalValue, fieldType),
            meta: {}
        };
    },

    getConditionValueObject: function(conditionInternalValue, fieldType, choiceValues, fieldInternalValue, tableName) {
        var isChoiceType = this.isChoiceType(fieldType);
        if (isChoiceType) {
            var displayValue = '';
            for (var i in conditionInternalValue) {
                for (var j in choiceValues) {
                    if (conditionInternalValue[i] === choiceValues[j].id) {
                        // Adding comma separated display values.
                        displayValue += (i == 0) ? choiceValues[j].label : ', ' + choiceValues[j].label;
                        break;
                    }
                }
            }
            var conditionMeta = {
                customOptions: this.getCustomFilterMeta(fieldInternalValue, tableName),
                canShowCustomOptions: conditionInternalValue.length === 1
            };
            if (tableName === 'topic_filters' && fieldInternalValue === 'Topic Nodes') {
                // Cannot show custom options if nodeType is not choice/boolean
                try {
                    var parsedInternalValue = JSON.parse(conditionInternalValue[0]);
                    conditionMeta.canShowCustomOptions = conditionInternalValue.length === 1 && parsedInternalValue.nodeType ? true : false;
                } catch (err) {
                    var errorMessage = 'Parsing failed during condition load: ' + err.message;
                    this.logger.error(errorMessage);
                }
            }

            return {
                internal: JSON.stringify(conditionInternalValue),
                display: displayValue,
                displayParts: choiceValues,
                meta: conditionMeta
            };
        }
        if ((fieldType == 'glide_date_time' || fieldType == 'glide_duration') && conditionInternalValue) {
            var vaUtils = new sn_ci_analytics.VADashboardUtils();
            var gdt = new GlideDateTime(conditionInternalValue);
            var displayVal = vaUtils.getFormattedTime(gdt.getNumericValue());
            return {
                internal: conditionInternalValue,
                display: displayVal,
                meta: {}
            };
        }
		if (fieldType == 'boolean' || fieldType == 'boolean_is_any') {
			return {
				internal: conditionInternalValue,
				display: conditionInternalValue,
				displayParts: [conditionInternalValue],
				meta: {}
			};
		}
        return {
            internal: conditionInternalValue,
            display: '',
            meta: {}
        };
    },

    getFieldPathObject: function(fieldInternalValue, fieldDisplayValue, fieldType, fieldBucketName, fieldReferenceTable) {
        return {
            fieldName: fieldInternalValue,
            fieldLabel: fieldDisplayValue,
            type: fieldType,
            table: fieldBucketName,
            referenceDataKey: fieldReferenceTable
        };
    },

    getCustomFilterMeta: function(field, tableName) {
        var getDefaultFilterMeta = function(linkName) {
            return [{
                "display": linkName,
                "type": "link",
                "action": "SN_VA_CONDITION_ROW#FILTER_BY_PROPS"
            }];
        };
        switch (tableName) {
            case 'va_funnel':
                {
                    switch (field) {
                        case "Event Trigger":
                        case "Topic":
                            return getDefaultFilterMeta("Filter properties");
                        default:
                            return [];
                    }
                }
            case 'va_conversations':
                {
                    switch (field) {
                        case "Events":
                            return getDefaultFilterMeta("Filter properties");
                        case "Topics":
                            return getDefaultFilterMeta("Add properties");
                        default:
                            return [];
                    }
                }

            case 'topic_sub_categories':
                {
                    return getDefaultFilterMeta("Add properties");
                }

            case 'topic_filters':
                {
                    switch (field) {
                        case 'Topic Nodes':
                            return getDefaultFilterMeta("Refine properties");
                    }
                }
        }
    },

    getAppseeRequestPayload: function(comparisonId, fieldInternalValue, tableName, comparisonModel) {
        switch (tableName) {
            case 'va_conversations':
            case 'va_users':
            case 'va_funnel':
                {
                    switch (fieldInternalValue) {
                        case 'End State':
                        case 'Feedback Result':
                        case 'Provider Name':
                            {
                                return {
                                    dynamic_property_name: fieldInternalValue
                                };
                            }

                        case 'Channel':
                        case 'Channels':
                            {
                                return {
                                    dynamic_property_name: 'Channel Name'
                                };
                            }

                        case 'Events':
                            {
                                return {
                                    event_type_filter: 'Custom'
                                };
                            }

                        case 'Topic Categories':
                            {
                                return {
                                    event_type_filter: 'Topic Category'
                                };
                            }

                        case 'Topic Blocks':
                            {
                                return {
                                    event_property_name: 'Parent Topic Name',
                                    event_type: 'Topic',
                                    valueTransformer: function(data) {
                                        return Object.keys(data);
                                    }
                                };
                            }

                        case 'Language':
                            {
                                return {
                                    language: true
                                };
                            }
                            // Funnel specific fields
                        case 'Event Trigger':
                            {
                                return {
                                    event_type_filter: 'Custom'
                                };
                            }
                        case 'Topic':
                            {
                                return {
                                    screen_type: '3',
                                    platform: '3',
                                    valueTransformer: function(data) {
                                        return data.map(function(topic) {
                                            return {
                                                id: topic.Name,
                                                label: topic.DisplayName
                                            };
                                        });
                                    }
                                };
                            }


                        case 'Topics':
                            {
                                return {
                                    platform: '3',
                                    screen_type: '3',
                                    valueTransformer: function(data) {
                                        return data.map(function(topic) {
                                            return ({
                                                id: topic.DisplayName,
                                                label: topic.DisplayName
                                            });
                                        });
                                    }
                                };
                            }
                    }
                    break;
                }

            case 'topic_sub_categories':
                {
                    return {
                        event_property_name: 'Sub Category',
                        event_type: 'Topic',
                        tableName: tableName,
                        fieldInternalValue: fieldInternalValue.split('.')[1]
                    };
                }

            case 'topic_nodes':
                {
                    return {
                        screen_type: '4',
                        platform: '3'
                    };
                }

            case 'topic_filters':
                {
                    var parentRow = this.getParentComparison(comparisonId, comparisonModel);
                    var topicName = parentRow.conditionValue[0];
                    return {
                        screen_type: '4',
                        platform: '3',
                        topicName: topicName
                    };
                }
            case 'topic_filters_funnel':
                {
                    var parentComparison = this.getParentComparison(comparisonId, comparisonModel);
                    var comparison = this._getComparison(comparisonId, comparisonModel);
                    var screenName = JSON.parse(comparison.conditionValue[0]).screenName;
                    var topicId = screenName.split("/")[0];

                    var payload = {
                        screen_type: '4',
                        platform: '3',
                    };
                    var topicName = parentComparison.conditionValue[0];
                    if (topicName === topicId) { // Topic as screen
                        payload['screenId'] = topicName;
                    } else { // Topic as event
                        payload['topicName'] = topicName;
                    }

                    return payload;
                }

            case 'topic_node_filter':
                {
                    var topicNodeComparisonRow = this.getParentComparison(comparisonId, comparisonModel);
                    var topicNodeId = JSON.parse(topicNodeComparisonRow.conditionValue[0]).screenName.split('/')[1];
                    return {
                        event_property_name: 'Selected Value',
                        event_type: 'Topic Node',
                        tableName: tableName,
                        fieldInternalValue: fieldInternalValue.split('.')[1],
                        nodeType: 'choice',
                        topicNodeId: topicNodeId
                    };
                }
        }
    },

    getPrePopulatedChoiceValues: function(comparisonId, fieldInternalValue, tableName, comparisonModel) {
        var requestPayload = this.getAppseeRequestPayload(comparisonId, fieldInternalValue, tableName, comparisonModel);
        var choices = requestPayload ? this.vaConditionBuilderAPIUtils.getAppseeAPIResponse(requestPayload) : this.conditionBuilderStaticChoiceValueFields[fieldInternalValue];
        if (requestPayload && requestPayload.valueTransformer) {
            choices = requestPayload.valueTransformer(choices);
        }
        var choiceList = [];
        if (Array.isArray(choices)) {
            if (typeof choices[0] === 'string') {
                choiceList = choices.map(function(choice) {
                    return {
                        id: choice,
                        label: choice
                    };
                });
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
        return choiceList;
    },

    isJson: function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },

    getParentComparison: function(comparisonId, comparisonModel) {
        for (var i in comparisonModel) {
            if (comparisonModel[i].children.length) {
                var children = comparisonModel[i].children;
                for (var j in children) {
                    if (children[j].id === comparisonId) {
                        return comparisonModel[i];
                    }
                }

                var searchParentInChildArray = this.getParentComparison(comparisonId, comparisonModel[i].children);
                if (searchParentInChildArray) {
                    return searchParentInChildArray;
                }
            }
        }
    },

    _getComparison: function(comparisonId, comparisonModel) {
        for (var i in comparisonModel) {
            if (comparisonModel[i].id === comparisonId)
                return comparisonModel[i];

            if (comparisonModel[i].children.length) {
                var match = this._getComparison(comparisonId, comparisonModel[i].children);
			if(match) return match;
            }
        }
    },

    isChoiceType: function(type) {
        return this.choiceFields.indexOf(type) > -1;
    },

    conditionBuilderStaticChoiceValueFields: {
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
    },

    guid: function() {
        var x = 2147483648;
        return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ Date.now()).toString(36);
    },

    _getComparisonModelForTable: function(table, minifiedComparison, parentComparison) {
        if (!table || !parentComparison || !parentComparison.field) return minifiedComparison;
        var internalTableMeta = this.vaConditionBuilderMetadataUtils.getInternalTableMapMetaData();
        if (internalTableMeta && internalTableMeta[table] && internalTableMeta[table].indexOf(parentComparison.field) >= 0) return parentComparison;
        return minifiedComparison;
    },
    _buildTableName: function(table, minifiedComparison, parentComparison) {
        try {
            var tableInternalMap = this.vaConditionBuilderMetadataUtils.getInternalTableMap();
            var comparison = this._getComparisonModelForTable(table, minifiedComparison, parentComparison);
            if (!tableInternalMap[table] || !tableInternalMap[table][comparison.field]) throw "default";
            var tableNameExpression = tableInternalMap[table][comparison.field];
            var regexs = tableNameExpression.match("%(.*)%");
            if (regexs) {
                var modelKey = regexs[1];
                if (!comparison[modelKey]) throw "error";
                return tableNameExpression.replace(regexs[0], comparison[modelKey]);
            }
            return tableNameExpression;
        } catch (e) {
            return table;
        }
    },

    type: 'VAConditionBuilderTransformationUtils'
};
