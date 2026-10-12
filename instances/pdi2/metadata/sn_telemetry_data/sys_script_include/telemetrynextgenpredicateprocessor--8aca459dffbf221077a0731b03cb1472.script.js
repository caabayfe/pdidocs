var TelemetryNextGenPredicateProcessor = Class.create();
TelemetryNextGenPredicateProcessor.prototype = {
    initialize: function() {
        this.predicateConstants = new TelemetryNextGenPredicateProcessorConstants();
        this.processedPredicates = [];
        this.usersDSL = [];
        this.userPropertiesDSL = [];
    },
    modifySessionsPredicateComposition: function(predicateComposition) {
        // remove the nested predicate composition for session exists and flatten the composition
        let predicates = predicateComposition?.predicate;
        let newPredicate = {
            ...predicates
        };
        // Note: In case of Group or Nested or Multiple Conditions -> We get predicates else we get predicate for single row
        if (newPredicate.predicates) {
            const sessionsPredicate = newPredicate.predicates?.find(item => item?.predicateProperties?.selectedProperty === "session");
            if (!sessionsPredicate)
                return predicates;
            const indexOfSessionPredicate = newPredicate.predicates.indexOf(sessionsPredicate);
            const sessionPredicates = newPredicate.predicates[indexOfSessionPredicate + 1]?.predicates;
            newPredicate.predicates.splice(indexOfSessionPredicate, 1);
            newPredicate.predicates.splice(indexOfSessionPredicate, 1, ...sessionPredicates);
            return newPredicate;
        } else return predicates;

    },
    createSingleCondition: function(property, selectedValue, selectedOperator) {
        // create a single dsl for single property
        // this condition is only to handle 'Both Platforms' option is legacy condition builder
        var modifiedSelectedValue = property === "OSType" && Array.isArray(selectedValue) && selectedValue[0] === '"[0,1]"' ? ["0", "1"] : selectedValue;
        // for number we need to send as a number not list, so remove the selected values from list and take first item
        modifiedSelectedValue = selectedOperator === "notequal" && Array.isArray(selectedValue) && selectedValue[0] ? selectedValue[0] : modifiedSelectedValue;
        if (property && ((typeof selectedValue === 'string' && selectedValue === '' && selectedOperator !== 'any') || (selectedValue)) && selectedOperator) {
            let dslCondition = {};
            switch (this.predicateConstants.OPERATORS_MAP[selectedOperator]) {
                case "$eq":
                case "$gt":
                case "$gte":
                case "$lt":
                case "$lte":
                case "$neq":
                    dslCondition = {
                        [property]: {
                            [this.predicateConstants.OPERATORS_MAP[selectedOperator]]: Array.isArray(selectedValue) && selectedValue.length > 0 ? selectedValue[0] : selectedValue
                        }
                    };
                    break;
                default:
                    dslCondition = {
                        [property]: {
                            [this.predicateConstants.OPERATORS_MAP[selectedOperator]]: modifiedSelectedValue
                        }
                    };
            }
            if (this.predicateConstants.USERS_AGGREGATE_FIELDS.includes(property)) {
                // only to manage user's properties for the required DSL
                this.usersDSL.push(dslCondition);
                return null;
            } else if (this.predicateConstants.CUSTOM_USER_PROPERTIES_PREFIX.some(item => property.startsWith(item))) {
                if (this.predicateConstants.CUSTOM_USER_PROPERTIES_LIST_KEYS.some(item => property.includes(item))) {
                    this.userPropertiesDSL.push({
                        "alias": property,
                        [this.predicateConstants.CUSTOM_USER_PROPERTIES_OPERATOR_MAP[selectedOperator]]: {
                            "field": property,
                            "value": selectedValue
                        }
                    });
                } else {
                    if (selectedOperator === "is_any") {
                        const value = this.isBooleanProperty(property) ? selectedValue.map(this.toBoolean) : selectedValue;
                        this.userPropertiesDSL.push({
                            [property]: {
                                "$in": value
                            }
                        });
                    }
                    if (selectedOperator === "is_not_any")
                        this.userPropertiesDSL.push({
                            [property]: {
                                "$not": {
                                    "$in": selectedValue
                                }
                            }
                        });
                }
                return null;
            }
            return dslCondition;
        } else return null;
    },
    createConditions: function(properties, selectedValues, selectedOperators) {
        // create DSL for each property
        let _self = this;
        if (Array.isArray(properties)) {

            return properties.map((property, idx) => _self.createConditions(property, [selectedValues[idx]] || [""], [selectedOperators[idx]] || [""])).flat();
        } else {
            // for event ptopperty make it list of events for each selected value.
            if ((properties === '$event' || properties === '$page') && selectedValues.length > 0) {
                if (selectedOperators[0] === "contain_all_of") {
                    return {
                        [properties]: {
                            "$and": selectedValues[0].map(selectedValue => this.createSingleCondition("Name", selectedValue, "equals_to"))
                        }
                    };
                } else if (selectedOperators[0] === "contain_any_of") {
                    return {
                        [properties]: {
                            "$and": [_self.createSingleCondition("Name", selectedValues[0] || "", selectedOperators[0])]
                        }
                    };
                }
            }
            if (selectedOperators[0] === "contain_all_of") {
                // manage 'constain_all_of' operator by distributing the selected items in and condition
                return selectedValues[0].map(selectedValue => _self.createSingleCondition(properties, selectedValue, "equals_to"));
            }
            if (selectedOperators[0] === "is_not_any") {
                // manage 'is not any' operator by distributing the selected items in and condition
                return selectedValues[0].map(selectedValue => _self.createSingleCondition(properties, selectedValue, "not_equals_to"));
            }
            if (selectedOperators[0] === "between") {
                const betweenOperators = ["greater_equal", "less"];
                return selectedValues[0].map((selectedValue, idx) => _self.createSingleCondition(properties, selectedValue, betweenOperators[idx])).filter(item => item != null);
            }
            return [_self.createSingleCondition(properties, selectedValues[0] || "", selectedOperators[0] || "")].filter(item => item != null);
        }
    },
    _processPredicate: function(pred, parentPredicate) {
        let _self = this;
        if (pred.type === "GROUPED_PREDICATE") {

            // Process grouped predicates (AND/OR)
            const dslGroup = {
                [`$${pred.groupType.toLowerCase()}`]: pred.predicates.flatMap(item => {
                    if (!_self.processedPredicates.includes(item))
                        return _self._processPredicate(item, pred);
                    return null;
                }).filter(result => result !== null)
            };
            return dslGroup;
        } else if (pred.type === "SINGLE_PREDICATE") {
            const props = pred.predicateProperties;
            const property = this.predicateConstants.KEY_MAP[props.selectedProperty] || props.selectedProperty;
            const operators = props.selectedOperator;
            const values = props.selectedValue;
            let combinedConditions = this.createConditions(property, values, operators);

            // Check for nested predicates
            const currentIdx = parentPredicate?.predicates?.indexOf(pred);
            if (typeof currentIdx === "number" && parentPredicate?.predicates[currentIdx + 1] && parentPredicate?.predicates[currentIdx + 1].type === "GROUPED_PREDICATE") {
                this.processedPredicates.push(parentPredicate?.predicates[currentIdx + 1]);

                // Handle nested group predicates (both AND with nested OR, and OR with nested AND)
                if (parentPredicate.type === "GROUPED_PREDICATE") {
                    const nextGroupedPredicate = parentPredicate?.predicates[currentIdx + 1];
                    const nestedGroupType = nextGroupedPredicate.groupType;

                    // Process the nested grouped predicate
                    const nestedPredicateResults = nextGroupedPredicate.predicates.flatMap(item => {
                        if (!_self.processedPredicates.includes(item))
                            return _self._processPredicate(item, nextGroupedPredicate);
                        return null;
                    }).filter(result => result !== null);

                    // Create a proper nested structure with the right group type
                    return {
                        [`$${nestedGroupType.toLowerCase()}`]: [
                            ...(Array.isArray(combinedConditions) ? combinedConditions : [combinedConditions]),
                            ...nestedPredicateResults
                        ]
                    };
                } else {
                    // For backward compatibility, use the original nested filter approach
                    const nestedFilter = {
                        "filter": _self._processPredicate(parentPredicate?.predicates[currentIdx + 1], parentPredicate?.predicates[currentIdx + 1])
                    };

                    if (Array.isArray(combinedConditions) && combinedConditions.length > 0)
                        combinedConditions[combinedConditions.length - 1] = {
                            ...combinedConditions[combinedConditions.length - 1],
                            ...nestedFilter
                        };
                    else if (typeof combinedConditions == 'object' && combinedConditions[property] && (property === '$event' || property === '$page')) {
                        combinedConditions[property]['$and'].push(nestedFilter['filter']);
                    } else {
                        combinedConditions = [nestedFilter];
                    }
                }
            }

            return combinedConditions;
        }
    },
    processPredicate: function(pred) {
        return this._processPredicate(pred, pred);
    },
    buildDSL: function(pred) {
        // build final DSL
        var dsl = this.processPredicate(pred);
        // handle single row predicate composition
        if (Array.isArray(dsl))
            dsl = {
                '$and': dsl
            };

        // attatch user's DSL to the final DSL object
        if (dsl['$and'] && this.usersDSL.length)
            dsl['$and'].push({
                '$user': {
                    '$and': this.usersDSL
                }
            });

        if (dsl['$or'] && this.usersDSL.length)
            dsl['$or'].push({
                '$user': {
                    '$or': this.usersDSL
                }
            });

        if (dsl['$and'] && this.userPropertiesDSL.length)
            dsl['$and'].push({
                '$userProperty': {
                    '$and': this.userPropertiesDSL
                }
            });

        if (dsl['$or'] && this.userPropertiesDSL.length)
            dsl['$or'].push({
                '$userProperty': {
                    '$or': this.userPropertiesDSL
                }
            });

        return dsl;
    },

    isBooleanProperty: function(name) {
        return name.startsWith(this.predicateConstants.CUSTOM_USER_PROPERTIES_PREFIX[0]);
    },

    toBoolean: function(value) {
        if (value == "true") return true;
        if (value == "false") return false;

        return value;
    },

    getDSL: function(predicateComposition) {
        return this.buildDSL(this.modifySessionsPredicateComposition(predicateComposition));
    },

    type: 'TelemetryNextGenPredicateProcessor'
};
