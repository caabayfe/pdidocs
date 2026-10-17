var VAConditionBuilderHelper = Class.create();
VAConditionBuilderHelper.prototype = {
    initialize: function() {
        this.va_constants = new VAConditionBuilderMap();
    },
    fail: function(errorCode) {
        var _errors = {
            'invalid_query': 'INVALID_QUERY',
            'invalid_comparison_type': 'INVALID_COMPARISON_TYPE',
            'invalid_steps': 'INVALID_FUNNEL_BUILDER_QUERY'
        };
        return {
            'success': false,
            'query': null,
            'error': _errors[errorCode] ? _errors[errorCode] : null
        };
    },
    success: function(payload) {
        return {
            'success': true,
            'query': payload,
            'error': null
        };
    },
    _hasChildren: function(children) {
        if (!children) return false;
        if (Array.isArray(children) && children.length > 0) return true;
        return false;
    },
    _cloneObject: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    _dotWalk: function(q, dotWalkKeys) {
        dotWalkKeys.forEach(function(path) {
            //Regex to parse Array. Eg. and[0] => and, 0
            var hasArrayIndex = /(.*)\[(.*)\]$/g.exec(path);
            if (hasArrayIndex && hasArrayIndex[1] && hasArrayIndex[2]) {
                q = q[hasArrayIndex[1]][Number(hasArrayIndex[2])];
            } else {
                q = q[path];
            }
        });
        return q;
    },
    _assignOperatorAndValue: function(table, internalField, internalOperatorObject, conditionValue, onlyConditionValue) {
        var value = null;
        var internalOperatorType = internalOperatorObject.type;
        switch (internalOperatorType) {
            case 'Array':
                value = conditionValue ? (Array.isArray(conditionValue) ? conditionValue : Array(conditionValue)) : Array();
                break;
            case 'Boolean':
                value = conditionValue ? (conditionValue.toString() == 'false' ? false : Boolean(conditionValue)) : Boolean();
                break;
            case 'String':
                value = conditionValue ? String(conditionValue) : String();
                break;
            case 'Number':
                value = conditionValue ? Number(conditionValue) : Number();
                break;
            default:
                value = conditionValue;
        }

        return onlyConditionValue ? value : this._attachOperator(table, internalField, internalOperatorObject, value);
    },
    _attachOperator: function(table, internalField, internalOperatorObject, computedValue) {
        var _self = this;
        var operatorModifer = this.va_constants.OPERATOR_MODIFIERS[table] &&
            this.va_constants.OPERATOR_MODIFIERS[table][internalField] &&
            (this.va_constants.OPERATOR_MODIFIERS[table][internalField][internalOperatorObject.to] || this.va_constants.OPERATOR_MODIFIERS[table][internalField]);

        if (operatorModifer) {
            switch (typeof operatorModifer) {
                case 'function':
                    return operatorModifer(computedValue);
                case 'string':
                    var utilityModifier = _self.va_constants.UTILITY_FUNCTIONS()[operatorModifer];
                    return utilityModifier(computedValue, internalOperatorObject.to);
            }
        }
        var result = {};
        result[internalOperatorObject.to] = computedValue;
        return result;
    },


    /**
     * 
     * @param {array} vaComparisonRows 
     * @returns {string} Appsee internal comparison type
     *          returns default if vaComparisonRows.length = 1
     *          returns computed vaComparisonRows[1].comparisonType if vaComparisonRows.length > 1
     */
    _computeRowOperator: function(vaComparisonRows) {
        if (!vaComparisonRows || !Array.isArray(vaComparisonRows)) return null;
        try {
            return (vaComparisonRows.length <= 1 ?
                this.va_constants.COMPARISON_TYPE_DEFAULT() :
                this.va_constants.COMPARISON_TYPES[vaComparisonRows[1][this.va_constants.VA_KEY.comparison_type]]).to;
        } catch (e) {
            return null;
        }
    },


    /**
     * 
     * @param {string} internalField 
     * @param {string} table 
     * @returns {object} Preset pattern
     */
    _computePatternType: function(internalField, table) {
        try {
            var richPattern = this.va_constants.FIELDS[table][internalField];

            //Regex to extract pattern and appsee_key from
            //Eg. 'STANDARD_EQ#SessionLocale' => STANDARD_EQ, SessionLocale
            var extractPattern = /(^.*)[#](.*$)/g.exec(richPattern);
            if (!extractPattern || !extractPattern[1] || !extractPattern[2]) return {
                'pattern': richPattern,
                'appsee_key': null
            };
            return {
                'pattern': extractPattern[1],
                'appsee_key': extractPattern[2]
            };
        } catch (e) {
            return null;
        }
    },


    /**
     * 
     * @param {object} comparisonRow 
     * @param {string} table 
     * @returns {string} internalField (field || overriden field)
     */
    _getInternalFieldValue: function(comparisonRow, table) {
        var va_keys = this.va_constants.VA_KEY;
        var internalField = comparisonRow[va_keys.field];
        if (!internalField) return null;
        return this.va_constants.FIELD_ALIAS[table][internalField] || internalField;
    },


    /**
     * 
     * @param {object} comparisonRow 
     * @param {string} table 
     * @returns {object} internalField (field || overriden field)
     */
    _getInternalOperatorObject: function(comparisonRow) {
        var va_keys = this.va_constants.VA_KEY,
            _self = this;
        var comparisonModelOperator = comparisonRow[va_keys.operator];
        if (!comparisonModelOperator || !comparisonModelOperator[va_keys.operator_value] || !comparisonModelOperator[va_keys.operator_type])
            return null;
        return {
            'to': _self.va_constants.OPERATORS[comparisonModelOperator[va_keys.operator_value]] || comparisonModelOperator[va_keys.operator_value],
            'type': comparisonModelOperator[va_keys.operator_type]
        };
    },

    _getInternals: function(comparisonRow, table) {
        var internalField = this._getInternalFieldValue(comparisonRow, table);
        if (!internalField) return null;

        var internalOperatorObject = this._getInternalOperatorObject(comparisonRow);
        if (!internalOperatorObject || !internalOperatorObject.type) return null;

        return {
            field: internalField,
            operator_object: internalOperatorObject
        };
    },

    //overrides all the available keys with values from incomingObj to originalObj. Rest keys are un-touched
    _deepReplace: function(originalObj, incomingObj) {
        var _self = this;
        for (var key in incomingObj) {
            if (Array.isArray(incomingObj[key])) {
                if (incomingObj[key].length > 0) {
                    incomingObj[key].forEach(function(incomingChildObj, index) {
                        return _self._deepReplace(originalObj[key][index], incomingChildObj);
                    });
                } else {
                    originalObj[key] = incomingObj[key]; //to copy children []
                }
            } else {
                originalObj[key] = incomingObj[key];
            }

        }
        return originalObj;
    },
    _standardEqProcessor: function(patternObject, internalField, internalOperatorObject, conditionValue, table) {
        try {
            var query = {};
            query[patternObject.appsee_key] = {};
            query[patternObject.appsee_key] = this._assignOperatorAndValue(table, patternObject.appsee_key, internalOperatorObject, conditionValue);
            return query;
        } catch (e) {
            return null;
        }
    },
    _customEventsEqProcessor: function(patternType, internalField, internalOperatorObject, conditionValue, table, children) {
        var query = null,
            _self = this;
        var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions;
        var baseStructure = patternDefinitions[patternType].structure;
        query = this._cloneObject(baseStructure);
        var q = query,
            dotWalkKeys = patternDefinitions[patternType].dotwalk_path;
        q = this._dotWalk(q, dotWalkKeys);
        q.push({
            'Name': this._assignOperatorAndValue(table, internalField, internalOperatorObject, conditionValue)
        });
        if (this._hasChildren(children)) {
            var childrenComparisonType = this._computeRowOperator(children);
            var properties = {};
            properties[childrenComparisonType] = [];
            children.forEach(function(eachChild) {
                var internal = _self._getInternals(eachChild, table);
                var innerProps = {};
                innerProps[internal.field] = {};
                innerProps[internal.field] = _self._assignOperatorAndValue(table, internal.field, internal.operator_object, eachChild[_self.va_constants.VA_KEY.condition_value]);
                properties[childrenComparisonType].push(innerProps);
            });
            q.push(patternDefinitions[patternType]['properties']);
            q = query;
            dotWalkKeys = patternDefinitions[patternType].properties_dotwalk_path;
            q = this._dotWalk(q, dotWalkKeys);
            q.nested_match = properties;
        }
        return query;
    },
    _dynamicPropEqProcessor: function(patternType, internalField, internalOperatorObject, conditionValue, table) {
        try {
            var query = null;
            var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions;
            var baseStructure = patternDefinitions[patternType].structure;
            query = this._cloneObject(baseStructure);
            var q = query,
                dotWalkKeys = patternDefinitions[patternType].dotwalk_path;
            q = this._dotWalk(q, dotWalkKeys);
            q[internalField] = this._assignOperatorAndValue(table, internalField, internalOperatorObject, conditionValue);
            return query;
        } catch (e) {
            return null;
        }
    },
    _customTopicNodeEqProcessor: function(patternType, comparisonRow, table) {
        try {
            var query = null,
                va_keys = this.va_constants.VA_KEY;
            var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions;
            var baseStructure = patternDefinitions[patternType].structure;
            query = this._cloneObject(baseStructure);
            var q = query,
                dotWalkKeys = patternDefinitions[patternType].dotwalk_path;
            q = this._dotWalk(q, dotWalkKeys);
            var internal = this._getInternals(comparisonRow, table);
            if (!internal) return null;
            q.ScreenId = this._assignOperatorAndValue(table, internal.field, internal.operator_object, comparisonRow[va_keys.condition_value]);
            return query;
        } catch (e) {
            return null;
        }
    },
    _mixedTopicEqProcessor: function(patternType, internalField, internalOperatorObject, conditionValue, table) {
        try {
            var query = null;
            var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions[patternType];
            var _map = patternDefinitions.maps[internalField];
            var baseStructure = patternDefinitions[_map.structure];
            query = this._cloneObject(baseStructure);
            var q = query,
                dotWalkKeys = patternDefinitions[_map.dotwalk_path],
                addInternalfield = _map.add_internal_field,
                dotWalkLastKey = _map.dotwalk_last_key,
                mixers = patternDefinitions.mixers;
            q = this._dotWalk(q, dotWalkKeys);

            var result = {},
                r;

            switch (internalOperatorObject.to) {
                case mixers.closed:
                    r = this._assignOperatorAndValue(table, internalField, internalOperatorObject, conditionValue);
                    if (addInternalfield)
                        result[internalField] = r;
                    else
                        result = r;
                    break;
                case mixers.open:
                    var userValues = this._assignOperatorAndValue(table, internalField, internalOperatorObject, conditionValue, true);
                    var _self = this;
                    var mixed = [];
                    userValues.forEach(function(userValue) {
                        var _defaultOperator = _self.va_constants.DEFAULT_OPERATOR;
                        r = _self._assignOperatorAndValue(table, internalField, _defaultOperator, userValue);
                        result = {};
                        if (addInternalfield)
                            result[internalField] = r;
                        else
                            result = r;
                        if (dotWalkLastKey) {
                            q[dotWalkLastKey] = result;
                        } else {
                            q.and = [result];
                        }
                        mixed.push(_self._cloneObject(query));
                    });
                    return mixed;
                default:
                    return null;
            }
            if (dotWalkLastKey) {
                q[dotWalkLastKey] = result;
            } else {
                q.and.push(result);
            }
            return query;
        } catch (e) {
            return null;
        }
    },
    _customTopicEqProcessor: function(patternType, comparisonRow, table) {
        /* Compute Topic Type. Can be either of 4 types
         *  If Topic has no children == topic_only
         *  If Topic has 1 cascaded children and field = 'Last Node Visited' === topic_with_completion_status
         *  If Topic has 1 cascaded children and field = 'Topic Node' === topic_with_topic_node
         *  If Topic has 1 cascaded children and field = 'Last Visited Node Name' === topic_last_visited_node_name
         *  If Topic has 2 level cascaded children === topic_choice
         */
        var query = [],
            _self = this,
            va_keys = this.va_constants.VA_KEY;
        var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions[patternType];
        var preSetFields = patternDefinitions.preset_fields;
        var topicTypes = patternDefinitions.topic_types;
        var configType = null;
        if (this._hasChildren(comparisonRow[va_keys.children])) {
            var child = comparisonRow[va_keys.children][0];
            var internalField = this._getInternalFieldValue(child, table);
            if (this._hasChildren(child[va_keys.children])) {
                var grandChild = child[va_keys.children][0];
                var gcInternalField = this._getInternalFieldValue(grandChild, table);
                if (gcInternalField == preSetFields.selected_value) {
                    configType = topicTypes.topic_choice;
                }
            } else if (internalField == preSetFields.last_visited_node) {
                configType = topicTypes.topic_with_completion_status;
            } else if (internalField == preSetFields.topic_node) {
                configType = topicTypes.topic_with_topic_node;
            } else if (internalField == preSetFields.last_visited_node_name) {
                configType = topicTypes.topic_last_visited_node_name;
            }
        } else {
            configType = topicTypes.topic_only;
        }
        if (!configType) return null;

        var configs = patternDefinitions.configurations[configType];
        configs.forEach(function(config) {
            if (config)
                query.push(_self._processComparisonModelByType(_self._deepReplace(_self._cloneObject(comparisonRow), config), table));
        });
        return query;
    },
    _extractParentNodeId: function(comparisonRow) {
        try {
            var va_keys = this.va_constants.VA_KEY;
            return comparisonRow[va_keys.children][0][va_keys.condition_value].screenName[0].split('/')[0];
        } catch (e) {
            return '';
        }
    },
    _parseValue: function(value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    },
    _customTopicChoiceEqProcessor: function(patternType, comparisonRow, table) {
        var query = null,
            va_keys = this.va_constants.VA_KEY;
        var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions[patternType];
        var replacers = patternDefinitions.replacer;

        //TODO: clean the mapping
        var clonedComparisonRow = this._cloneObject(comparisonRow);
        clonedComparisonRow.conditionValue = [clonedComparisonRow.children[0].children[0].conditionValue.topic_node_name];

        query = this._processComparisonModelByType(this._deepReplace(clonedComparisonRow, replacers), table);
        var q = query,
            dotWalkKeys = patternDefinitions.dotwalk_path;
        q = this._dotWalk(q, dotWalkKeys);
        q.and = [];

        //fetch the required values. No hard check required. If exception, handled in parent.
        var requiredKeys = patternDefinitions.prop_labels,
            requiredvalues = {};
        requiredvalues.type = clonedComparisonRow[va_keys.children][0][va_keys.condition_value].nodeType; //fetch the value from parent's conditionValue
        requiredvalues.selected_value = this._parseValue(clonedComparisonRow[va_keys.children][0][va_keys.children][0][va_keys.condition_value].selected_value);
        requiredvalues.topic_node_id = this._extractParentNodeId(clonedComparisonRow);
        for (var key in requiredKeys) {
            var keyLabel = requiredKeys[key],
                prop = {};
            prop[keyLabel] = {
                'eq': requiredvalues[key]
            };
            q.and.push(prop);
        }
        return query;
    },
    _conversationQueryEqProcessor: function(patternType, conversationComparisonRows, table) {
        var query = null;
        var patternDefinitions = this.va_constants.APPSEE_QUERY_PATTERNS.definitions[patternType];
        var baseStructure = patternDefinitions.structure;
        query = this._cloneObject(baseStructure);
        var q = query,
            dotWalkKeys = patternDefinitions.dotwalk_path;
        q = this._dotWalk(q, dotWalkKeys);
        var innerResults = this.transformConditionBuilder(conversationComparisonRows, table);
        q.child_match = innerResults;
        return query;
    },
    _setupFunnelAlternativeStructure: function(baseComparisonModel) {
        var _self = this,
            internalField = {},
            funnelMetadata = this.va_constants.FIELDS.va_funnels,
            va_keys = this.va_constants.VA_KEY;
        try {
            internalField = funnelMetadata.step_types[baseComparisonModel[va_keys.field]];
            if (!internalField) return null;
            var struct = _self._cloneObject(funnelMetadata.alternative_structure);
            struct.StepType = internalField.tagged_enum;
            if (internalField.has_value) {
                struct.Value = baseComparisonModel[va_keys.condition_value].toString();
            }
            if (baseComparisonModel[va_keys.children] && Array.isArray(baseComparisonModel[va_keys.children])) {
                baseComparisonModel[va_keys.children].forEach(function(baseComparisonModelChild, index) {
                    struct.ExtraValues[baseComparisonModelChild[va_keys.field]] = baseComparisonModelChild[va_keys.condition_value];
                });
            }
            return struct;
        } catch (e) {
            return null;
        }
    },
    _funnelBuilderEqProcessor: function(vaFunnelBuilderRow) {
        var steps = [],
            _self = this,
            funnelBase = {},
            funnelAlternative = null,
            funnelMetadata = this.va_constants.FIELDS.va_funnels,
            va_keys = this.va_constants.VA_KEY;
        try {
            funnelBase = _self._cloneObject(funnelMetadata.base_structure);
            funnelBase[va_keys.step_number] = parseInt(vaFunnelBuilderRow[va_keys.step_number]);
            vaFunnelBuilderRow.VAComparisonModel.forEach(function(VaComparisonModelRow, innerIndex) {
                funnelAlternative = _self._setupFunnelAlternativeStructure(VaComparisonModelRow);
                if (funnelAlternative)
                    funnelBase.Alternatives.push(funnelAlternative);
            });
            steps.push(funnelBase);
            return steps;
        } catch (e) {
            return null;
        }
    },


    /**
     * 
     * @param {object} comparisonRow 
     * @param {string} table 
     * @returns {object} appsee internal structure
     */
    _processComparisonModelByType: function(comparisonRow, table) {
        try {
            var va_keys = this.va_constants.VA_KEY,
                _self = this;
            var tables = this.va_constants.TABLES;
            switch (table) {
                case tables.va_conversations:
                case tables.va_users:
                    var internal = this._getInternals(comparisonRow, table);
                    if (!internal) return null;
                    var internalField = internal.field;
                    var internalOperatorObject = internal.operator_object;

                    var patternTypeObject = this._computePatternType(internalField, table);
                    if (!patternTypeObject) return null;

                    var patterns = this.va_constants.APPSEE_QUERY_PATTERNS.supported_patterns;
                    if (!patterns) return null;
                    switch (patternTypeObject.pattern) {
                        case patterns.custom_events_eq:
                            return _self._customEventsEqProcessor(patternTypeObject.pattern, internalField, internalOperatorObject, comparisonRow[va_keys.condition_value], table, comparisonRow[va_keys.children]);
                        case patterns.standard_eq:
                            return _self._standardEqProcessor(patternTypeObject, internalField, internalOperatorObject, comparisonRow[va_keys.condition_value], table);
                        case patterns.dynamic_prop_eq:
                            return _self._dynamicPropEqProcessor(patternTypeObject.pattern, internalField, internalOperatorObject, comparisonRow[va_keys.condition_value], table);
                        case patterns.mixed_topic_eq:
                            return _self._mixedTopicEqProcessor(patternTypeObject.pattern, internalField, internalOperatorObject, comparisonRow[va_keys.condition_value], table);
                        case patterns.custom_topic_eq:
                            return _self._customTopicEqProcessor(patternTypeObject.pattern, comparisonRow, table);
                        case patterns.custom_topic_node_eq:
                            return _self._customTopicNodeEqProcessor(patternTypeObject.pattern, comparisonRow[va_keys.children][0], table);
                        case patterns.conversation_query_eq:
                            return _self._conversationQueryEqProcessor(patternTypeObject.pattern, comparisonRow[va_keys.children], tables.va_conversations);
                        case patterns.custom_topic_choice_eq:
                            return _self._customTopicChoiceEqProcessor(patternTypeObject.pattern, comparisonRow, table);
                        default:
                            return null;
                    }
                case tables.va_funnels:
                    return _self._funnelBuilderEqProcessor(comparisonRow);
                default:
                    return null;
            }
        } catch (e) {
            return null;
        }
    },
    _processComparisonModel: function(vaComparisonRows, table) {
        var query = null,
            result = [],
            _self = this;
        vaComparisonRows.forEach(function(vaComparisonRow, vaComparisonRowIndex) {
            query = _self._processComparisonModelByType(vaComparisonRow, table);
            if (query) {
                if (Array.isArray(query)) {
                    query.forEach(function(_q) {
                        result.push(_q);
                    });
                } else {
                    result.push(query);
                }
            }
        });
        return result;
    },


    /**
     * 
     * @param {array} vaComparisonRows 
     * @param {string} table 
     * @returns {object} appsee query
     */
    transformConditionBuilder: function(vaComparisonRows, table) {
        var _self = this,
            tables = this.va_constants.TABLES;
        try {
            var comparisonType = _self._computeRowOperator(vaComparisonRows);
            var result = _self._processComparisonModel(vaComparisonRows, table);
            if (table == tables.va_funnels) return result;
            var response = {};
            response[comparisonType] = result;
            return response;
        } catch (e) {
            return null;
        }
    },
    type: 'VAConditionBuilderHelper'
};
