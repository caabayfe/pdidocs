var UXALegacyPredicateProcessor = Class.create();
UXALegacyPredicateProcessor.prototype = {
    initialize: function() {
        this.uxaDSLConstants = new UXADSLConstants();
    },
    /**
     * The function `updateOperatorLabels` takes an array of operators and a mapping of operator IDs to
     * names, and returns a new array of operators with updated labels based on the mapping.
     * @param operators - An array of operator objects. Each operator object has an `id` property.
     * @param operatorsNamesMapping - An object that maps operator IDs to their corresponding labels.
     * @returns an array of operators with updated labels.
     */
    updateOperatorLabels: function(operators, operatorsNamesMapping) {
        return operators.reduce((acc, operator) => {
            const {
                id
            } = operator;
            if (operatorsNamesMapping[id]) {
                acc.push({
                    ...operator,
                    label: operatorsNamesMapping[id]
                });
            } else {
                acc.push(operator); // If no match found, keep the original object
            }
            return acc;
        }, []);
    },
    getNestingVarsByRowId: function(rowId) {
        const cleanedRowId = rowId.replace(/-/g, "");
        return {
            customActionButtonUniqueId: `customActionButtonUniqueId_${cleanedRowId}`,
            nestedListUniqueId: `nested_${cleanedRowId}`,
        };
    },

    getPropertyAllOperators: function(operators, property) {
        let typeOperators = operators[property.type.toLowerCase()];
        if (property.customizations) {
            if (property.customizations.additionalOperators) {
                typeOperators = [
                    ...typeOperators,
                    ...property.customizations.additionalOperators,
                ];
            }
            if (property.customizations.displayOperators) {
                typeOperators = typeOperators.filter((operator) =>
                    property.customizations.displayOperators.includes(operator.id),
                );
            }
            if (property.customizations.operatorsNamesMapping) {
                typeOperators = this.updateOperatorLabels(
                    typeOperators,
                    property.customizations.operatorsNamesMapping,
                );
            }
        }
        return typeOperators;
    },

    isNoValueOperator: function(operator) {
        return this.uxaDSLConstants.noValueOperators.includes(operator);
    },

    /**
     * The function `getPropertyById` searches for a property in a given array of properties based on its
     * ID, including cascaded and nested properties.
     * @param propertyId - The propertyId parameter is the unique identifier of the property you want to
     * retrieve.
     * @param properties - An array of property objects. Each property object has the following structure:
     * @param [rowId=null] - The `rowId` parameter is an optional parameter that represents the unique
     * identifier of a row. It is used to search for nested properties within a specific row. If a `rowId`
     * is provided, the function will check if the `property` object has a nested list with a unique
     * identifier matching
     * @returns the property details that match the given propertyId.
     */
    getPropertyById: function(propertyId, properties, rowId = null) {
        /* Get the property details from the given Id */
        let propertyData = null;

        const searchProperty = (property) => {
            /* This is a recursive function for the searching in cascade and nested properties */
            if (property.id === propertyId) {
                propertyData = property;
                return;
            }

            if (property.cascade) {
                property.cascade.forEach((cascadedProperty) => {
                    searchProperty(cascadedProperty);
                });
            }

            if (property.nested) {
                property.nested.forEach((nestedProperty) => {
                    searchProperty(nestedProperty);
                });
            }

            if (rowId) {
                const vars = this.getNestingVarsByRowId(rowId);
                if (vars.nestedListUniqueId in property) {
                    property[vars.nestedListUniqueId].forEach((nestedProperty) => {
                        searchProperty(nestedProperty);
                    });
                }
            }
        };
        for (let property of properties) {
            searchProperty(property);
            if (propertyData) {
                break;
            }
        }
        return propertyData;
    },

    /**
     * The function `createCombinedDSL` creates a combined DSL (Domain Specific Language) based on the
     * given predicate, query properties, and operators.
     * @param predicate - The `predicate` parameter is an object that represents a predicate or a group of
     * predicates. It contains the following properties:
     * @param queryProperties - An object containing information about the available properties for the
     * query. It includes properties like propertyId, propertyName, propertyType, and dslType.
     * @param operators - The `operators` parameter is an object that contains different operators that can
     * be used in the DSL (Domain Specific Language) query. It likely includes properties such as `equals`,
     * `notEquals`, `contains`, `startsWith`, etc. These operators are used to define the conditions for
     * the query.
     * @param [forNestedRow=false] - A boolean value indicating whether the current predicate is inside a
     * nested row or not. It is set to false by default.
     * @param [groupType=AND] - The `groupType` parameter is a string that specifies the type of grouping
     * for the predicates. It can have two possible values: "AND" or "OR". The default value is "AND".
     * @returns The function `createCombinedDSL` returns an array containing two elements: `propertiesDSL`
     * and `groupType`.
     */
    createCombinedDSL: function(
        predicate,
        queryProperties,
        operators,
        forNestedRow = false,
        groupType = "AND",
    ) {
        //var groupType = "AND";
        let propertiesDSL = [];
        // If we have multiple predicates or just one single predicate
        if (predicate.predicates) {
            //groupType = predicate.groupType;
            for (let rowIndex = 0; rowIndex < predicate.predicates.length; rowIndex++) {
                // handle single predicate in each row
                const predicateItem = predicate.predicates[rowIndex];
                if (
                    predicateItem.predicateProperties &&
                    predicateItem.predicateProperties.selectedProperty
                ) {
                    const isFromEvents =
                        predicateItem.predicateProperties.parentPropertyId ===
                        "SessionCustomEvents" ||
                        predicateItem.predicateProperties.selectedProperty ===
                        "SessionCustomEvents";

                    const data = this.getPropertyDataFromPredicate(
                        predicateItem,
                        queryProperties,
                        operators,
                        forNestedRow,
                        isFromEvents,
                    );
                    propertiesDSL.push(data);
                }
                // handle nested predicates ie, group predicate inside each
                if (
                    predicate.predicates[rowIndex] &&
                    predicate.predicates[rowIndex].type === "GROUPED_PREDICATE"
                ) {
                    const nestedPredicateComposition = predicate.predicates[rowIndex];
                    const [dslData, dslGroupType] = this.createCombinedDSL(
                        nestedPredicateComposition,
                        queryProperties,
                        operators,
                        true,
                        nestedPredicateComposition.groupType,
                    );

                    // get the relaztion type for prevoius propId in the array
                    let parentRowId = null;
                    if (predicateItem.predicateProperties) {
                        parentRowId = predicateItem.predicateProperties.parentRowId;
                    }
                    const selectedPropertyData = this.getPropertyById(
                        propertiesDSL[propertiesDSL.length - 1].propId,
                        queryProperties,
                        parentRowId,
                    );
                    let nestedDSL;

                    if (selectedPropertyData.dslType === "cascade") {
                        nestedDSL = this.createNestedDSLForCascadedProperties(
                            dslData,
                            selectedPropertyData,
                            nestedPredicateComposition.groupType.toLowerCase(),
                        );
                        // add DSL if its not already present
                        if (!propertiesDSL[propertiesDSL.length - 1]["dsl"]) {
                            const nested_match = {};
                            nested_match[dslGroupType.toLowerCase()] = [];
                            propertiesDSL[propertiesDSL.length - 1]["dsl"] = {
                                nested_match,
                            };
                        }

                        if (
                            propertiesDSL[propertiesDSL.length - 1]["dsl"]["nested_match"][
                                dslGroupType.toLowerCase()
                            ]
                        ) {
                            propertiesDSL[propertiesDSL.length - 1]["dsl"]["nested_match"][
                                dslGroupType.toLowerCase()
                            ].push(nestedDSL);
                        } else {
                            propertiesDSL[propertiesDSL.length - 1]["dsl"]["nested_match"][
                                Object.keys(
                                    propertiesDSL[propertiesDSL.length - 1]["dsl"]["nested_match"],
                                )[0]
                            ].push(nestedDSL);
                        }
                    } else if (selectedPropertyData.dslType === "nested") {
                        nestedDSL = this.createNestedDSLForNestedProperties(dslData);
                        if (!propertiesDSL[propertiesDSL.length - 1]["dsl"]) {
                            const child_match = {};
                            child_match[dslGroupType.toLowerCase()] = [];
                            propertiesDSL[propertiesDSL.length - 1]["dsl"] = {
                                child_match,
                            };
                        }
                        propertiesDSL[propertiesDSL.length - 1]["dsl"]["child_match"][
                            dslGroupType.toLowerCase()
                        ] = nestedDSL;
                    }
                }
            }
        } else {
            if (predicate.predicateProperties.selectedProperty) {
                const data = this.getPropertyDataFromPredicate(
                    predicate,
                    queryProperties,
                    operators,
                );
                propertiesDSL.push(data);
            }
        }
        return [propertiesDSL, groupType];
    },

    /**
     * The function creates a nested DSL object for cascaded properties in JavaScript.
     * @param dslData - An array of objects containing DSL data. Each object has two properties: "propId"
     * (string) and "dsl" (object).
     * @param selectedPropertyData - The `selectedPropertyData` parameter is an object that contains
     * information about the selected property. It should have the following properties:
     * @param [groupType=and] - The `groupType` parameter is a string that specifies how the cascaded
     * properties should be grouped together. It has a default value of "and", which means that all the
     * cascaded properties must match for the final DSL to be considered a match.
     * @returns The function `createNestedDSLForCascadedProperties` returns a final DSL (Domain Specific
     * Language) object.
     */
    createNestedDSLForCascadedProperties: (
        dslData,
        selectedPropertyData,
        groupType = "and",
    ) => {
        const cascadedArray = [];
        dslData.forEach((dslItem) => {
            const dsl = {};
            dsl[dslItem.propId] = dslItem.dsl;
            cascadedArray.push(dsl);
        });
        const finalDSL = {};
        const nested_match_object = {};
        nested_match_object[groupType] = cascadedArray;
        finalDSL[selectedPropertyData.nestedKeyName] = {
            nested_match: nested_match_object,
        };
        return finalDSL;
    },

    /**
     * The function creates a nested DSL (Domain Specific Language) for nested properties based on the
     * provided DSL data.
     * @param dslData - An array of objects, where each object represents a nested property and its
     * corresponding DSL (Domain Specific Language) data. Each object has two properties:
     * @returns The function `createNestedDSLForNestedProperties` returns an array of objects. Each object
     * in the array represents a nested property and its corresponding DSL (Domain Specific Language) data.
     */
    createNestedDSLForNestedProperties: function(dslData) {
        const cascadedArray = [];
        dslData.forEach((dslItem) => {
            const dsl = {};
            dsl[dslItem.propId] = dslItem.dsl;
            cascadedArray.push(dsl);
        });
        return cascadedArray;
    },

    /**
     * The function `getDSLForUserEntityCascadeSpecialProperty` takes in various parameters and returns an
     * object with a property ID and a DSL (Domain Specific Language) object This is specifically used for User entity cascade properties.
     * @param operator - The `operator` parameter is a string representing the operator used in the DSL
     * (Domain Specific Language) query. It is used to determine the appropriate DSL key for the operator
     * in the resulting DSL object.
     * @param selectedPropertyData - The `selectedPropertyData` parameter is an object that contains
     * information about the selected property. It has the following properties:
     * @param selectedOperator - The `selectedOperator` parameter is the operator selected by the user. It
     * could be a string representing the operator, such as "equals", "greaterThan", "lessThan", etc.
     * @returns an object with two properties: "propId" and "dsl".
     */
    getDSLForUserEntityCascadeSpecialProperty: function(
        operator,
        selectedPropertyData,
        selectedOperator,
        [
            [platform], value
        ],
    ) {
        const operatorDSLKey = this.getDSLFormOperator(operator);
        let dslPropertyName = "";
        let dsl = {};
        let convertedValues = value;
        const isConvertToNumber =
            selectedPropertyData.cascade[1].returnDataType === "number" ||
            selectedPropertyData.cascade[1].returnDataType === "duration";

        if (selectedPropertyData.cascade[1].type === "duration") {
            convertedValues = this.convertSecondsToMilliseconds(value);
        }

        switch (platform) {
            case "0":
                dslPropertyName = `UserPlatformProperties.iOS.${selectedPropertyData.nestedPropName}`;
                break;
            case "1":
                dslPropertyName = `UserPlatformProperties.Android.${selectedPropertyData.nestedPropName}`;
                break;
            case "0,1":
            case "[0,1]":
            case '"[0,1]"':
                dslPropertyName = "UserPlatforms";
                break;
        }

        if (selectedOperator[1] === "between") {
            dsl[operatorDSLKey[0]] = isConvertToNumber ?
                +convertedValues[0] :
                convertedValues[0];
            dsl[operatorDSLKey[1]] = isConvertToNumber ?
                +convertedValues[1] :
                convertedValues[1];
        } else {
            if (Array.isArray(convertedValues)) {
                dsl[operatorDSLKey] = convertedValues.map((value) =>
                    isConvertToNumber ? +value : value,
                );
            } else {
                dsl[operatorDSLKey] = isConvertToNumber ?
                    +convertedValues :
                    convertedValues;
            }
        }

        return {
            propId: dslPropertyName,
            dsl,
        };
    },

    convertSecondsToMilliseconds: function(values) {
        if (Array.isArray(values)) {
            return values.map((value) => parseInt(value) * this.uxaDSLConstants.MILLISECONDS_IN_SECONDS);
        } else {
            return parseInt(values) * this.uxaDSLConstants.MILLISECONDS_IN_SECONDS;
        }
    },

    /**
     * The function `generateDSLForProperty` generates a DSL (Domain Specific Language) based on the
     * selected property data, value, and operator.
     * @param selectedPropertyData - An object containing data about the selected property. It includes
     * properties like returnDataType, type, and id.
     * @param selectedValue - The selected value for the property. It can be a single value or an array of
     * values depending on the property type and operator.
     * @param selectedOperator - The selected operator for the DSL generation.
     * @param operators - An array of operator objects that define the available operators for a property.
     * Each operator object has the following properties:
     * @param [isFromEvents=false] - A boolean value indicating whether the DSL is being generated from
     * events or not.
     * @returns The function `generateDSLForProperty` returns the generated DSL (Domain Specific Language)
     * based on the provided inputs.
     */
    generateDSLForProperty: function(
        selectedPropertyData,
        selectedValue,
        selectedOperator,
        operators,
        isFromEvents = false,
    ) {
        let dsl;

        let returnDataType = selectedPropertyData.returnDataType;
        const typeOperators = this.getPropertyAllOperators(
            operators,
            selectedPropertyData,
        );
        const operator = typeOperators.find(
            (operator) => operator.id === selectedOperator,
        );

        if (
            selectedPropertyData.type.toLowerCase() === "date" &&
            selectedOperator === "in_last"
        ) {
            returnDataType = "number";
        }

        if (operator.id === "is_set" || operator.id === "is_not_set") {
            returnDataType = "string";
            selectedValue = [selectedPropertyData.id];
        }

        if (
            selectedPropertyData.type.toLowerCase() === "existencebasedboolean" &&
            operator.id !== "is_set" &&
            operator.id !== "is_not_set"
        ) {
            if (!isFromEvents && !selectedPropertyData.custom) {
                let dslCondition = "";
                if (selectedValue.length > 0) {
                    dslCondition = selectedValue[0][0] ? "exists" : "not exists";
                    const dslTemplate = operator.dsl.replace("{1}", dslCondition);
                    dsl = this.replacePlaceholders(dslTemplate, [true]);
                }
            } else {
                const dslTemplate = '{"eq":{0}}';
                dsl = this.replacePlaceholders(dslTemplate, selectedValue[0]);
            }
        } else {
            if (!Array.isArray(selectedValue)) {
                selectedValue = [selectedValue];
            }

            // Check if selectedValue is a 2D array
            if (
                Array.isArray(selectedValue) &&
                selectedValue.length > 0 &&
                Array.isArray(selectedValue[0])
            ) {
                selectedValue = selectedValue.flat(); // Convert to 1D array
            }

            if (selectedPropertyData.type.toLowerCase() === "duration") {
                selectedValue[0] = this.convertSecondsToMilliseconds(selectedValue[0]);
                if (operator.id === "between") {
                    selectedValue[1] = this.convertSecondsToMilliseconds(selectedValue[1]);
                }
            }

            if (
                selectedPropertyData.type.toLowerCase() === "platform" &&
                selectedValue[0] === '"[0,1]"'
            ) {
                selectedValue[0] = "0,1";
            }

            dsl = this.replacePlaceholders(operator.dsl, selectedValue, returnDataType);
        }
        return dsl;
    },

    /**
     * The function `replacePlaceholders` replaces placeholders in a template string with corresponding
     * values and returns the modified string.
     * @param template - The `template` parameter is a string that contains placeholders in the form of
     * `{0}`, `{1}`, etc. These placeholders will be replaced with values from the `values` array.
     * @param values - An array of values that will be used to replace the placeholders in the template.
     * @param returnDataType - The `returnDataType` parameter is a string that specifies the desired data
     * type of the returned value. It can have one of the following values: "string" or "date".
     * @returns the modified template string after performing the string replacement.
     */
    replacePlaceholders: function(template, values, returnDataType) {
        /* The above code is performing string replacement in a template. */
        const shouldWrapWithQuotes =
            returnDataType === "string" || returnDataType === "date";

        if (template.includes("{0}") && template.includes("{1}")) {
            // Replace {0} with values[0] and {1} with values[1]
            template = template.replace(
                "{0}",
                shouldWrapWithQuotes ? `"${values[0]}"` : values[0],
            );
            template = template.replace(
                "{1}",
                shouldWrapWithQuotes ? `"${values[1]}"` : values[1],
            );
        } else if (template.includes("{0}")) {
            // Replace {0} with all values from selectedValue, enclosed in double quotes if they are strings
            const replacedValue = values
                .map((value) => (shouldWrapWithQuotes ? `"${value}"` : value))
                .join(",");
            template = template.replace("{0}", replacedValue);
        }
        return template;
    },

    /**
     * The function `getDSLFormOperator` extracts all keys inside double quotes from a JSON string.
     * @param operator - The `operator` parameter is an object that contains a property called `dsl`, which
     * is a JSON string. The purpose of the `getDSLFormOperator` function is to extract all the keys from
     * the JSON string and return them as an array.
     * @returns The function `getDSLFormOperator` returns an array of keys found in the JSON string
     * `operator.dsl` that are enclosed in double quotes. If no matches are found, it returns `null`.
     */
    getDSLFormOperator: function(operator) {
        // Define a regular expression pattern to match text inside double quotes
        const regex = /"([^"]+)"/g;

        // Use the regex to find all keys in the JSON string
        const matches = operator.dsl.match(regex);
        if (matches) {
            return matches.map((match) => match.slice(1, -1));
        }
        return null;
    },

    getDSLForScreens: function(operator, selectedOperator, selectedValue) {
        const operatorDSLKey = this.getDSLFormOperator(operator);
        return {
            nested_match: {
                and: [{
                    ScreenId: {
                        [operatorDSLKey[0]]: selectedValue ?
                            this.parseScreenFilterValue(selectedValue) : "",
                    },
                }, ],
            },
        };
    },

    /**
     * The function `getPropertyDataFromPredicate` generates DSL (Domain Specific Language) based on the
     * provided predicate, query properties, and operators.
     * @param predicate - An object containing information about the predicate, such as the selected
     * property, operator, and value.
     * @param queryProperties - An object containing information about the available properties for
     * querying. It includes properties like "selectedProperty", "selectedOperator", "selectedValue",
     * "parentRowId", and "rowId".
     * @param operators - An object containing all the available operators for the properties. Each
     * operator is represented by an object with properties like id, name, and dsl.
     * @param [forNestedRow=false] - A boolean value indicating whether the property is for a nested row or
     * not. If true, it means the property is being used in a nested row.
     * @param [isFromEvents=false] - The `isFromEvents` parameter is a boolean flag that indicates whether
     * the property data is coming from events or not. It is used in the DSL generation process to handle
     * specific cases related to event properties.
     * @returns The function `getPropertyDataFromPredicate` returns an object with two properties: `propId`
     * and `dsl`. The `propId` property represents the DSL property name or the ID of the selected
     * property. The `dsl` property represents the DSL (Domain Specific Language) generated based on the
     * selected property, operator, and value.
     */
    getPropertyDataFromPredicate: function(
        predicate,
        queryProperties,
        operators,
        forNestedRow = false,
        isFromEvents = false,
    ) {
        const {
            predicateProperties: {
                selectedProperty,
                selectedOperator,
                selectedValue,
                parentRowId,
                rowId,
            },
        } = {
            ...predicate
        };

        const selectedPropertyData = this.getPropertyById(
            selectedProperty,
            queryProperties,
            parentRowId,
        );

        let dsl;
        if (!selectedPropertyData.cascade && !selectedPropertyData.nested) {
            // DSL generation for non cascade properties
            if (selectedPropertyData.dslPropertyName === "SessionScreens") {
                const typeOperators = this.getPropertyAllOperators(
                    operators,
                    selectedPropertyData,
                );
                const operator = typeOperators.find(
                    (op) => op.id === selectedOperator[0],
                );

                dsl = this.getDSLForScreens(operator, selectedOperator, selectedValue[0]);
            } else {
                //DSL generation for all regular properties
                const typeOperators = this.getPropertyAllOperators(
                    operators,
                    selectedPropertyData,
                );
                const operator = typeOperators.find(
                    (op) => op.id === selectedOperator[0],
                );

                if (operator.id === "is_set" || operator.id === "is_not_set") {
                    selectedPropertyData.dslPropertyName = "UserCustomPropertyNames";
                }

                let valueForDsl = selectedValue.length ? selectedValue[0] : "";

                if (operator.dsl.includes("{1}")) {
                    valueForDsl = selectedValue;
                }

                dsl = JSON.parse(
                    this.generateDSLForProperty(
                        selectedPropertyData,
                        valueForDsl,
                        selectedOperator[0],
                        operators,
                        isFromEvents,
                    ),
                );
            }
        } else if (selectedPropertyData.cascade) {
            if (
                selectedPropertyData.id === "UserTotalSessionsMobile" ||
                selectedPropertyData.id === "UserTotalDurationMobile"
            ) {
                if (selectedValue[0][0] === '"[0,1]"') {
                    selectedPropertyData.dslType = "simple";
                } else {
                    selectedPropertyData.dslType = undefined;
                }
            }

            // DSL generation for Cascaded Properties
            if (selectedPropertyData.id === "SessionScreens") {
                const typeOperators =
                    operators[selectedPropertyData.cascade[1].type.toLowerCase()];
                const operator = typeOperators.find(
                    (op) => op.id === selectedOperator[1],
                );
                dsl = this.getDSLForScreens(operator, selectedOperator, selectedValue[1]);
            } else if (
                selectedPropertyData.nestedPropName &&
                selectedPropertyData.dslType !== "simple"
            ) {
                const typeOperators =
                    operators[selectedPropertyData.cascade[1].type.toLowerCase()];
                const operator = typeOperators.find(
                    (op) => op.id === selectedOperator[1],
                );
                return this.getDSLForUserEntityCascadeSpecialProperty(
                    operator,
                    selectedPropertyData,
                    selectedOperator,
                    selectedValue,
                );
            } else if (selectedPropertyData.dslType === "simple") {
                let nestedMatchList = [];
                selectedPropertyData.cascade.forEach((property, idx) => {
                    // handle the edge case where the values component is hidden when operator is any
                    if (selectedValue[idx]) {
                        const propertyDSL = this.generateDSLForProperty(
                            property,
                            selectedValue[idx],
                            selectedOperator[idx],
                            operators,
                        );
                        const propertyDSLObject = {};
                        const dslPropertyName = property.dslPropertyName ?
                            property.dslPropertyName :
                            property.id;
                        propertyDSLObject[dslPropertyName] = JSON.parse(propertyDSL);
                        nestedMatchList.push(propertyDSLObject);
                    }
                });
                dsl = {
                    simple_match: nestedMatchList
                };
            } else {
                let nestedMatchList = [];

                const isFromEvents = selectedPropertyData.id === "SessionCustomEvents";

                selectedPropertyData.cascade.forEach((property, idx) => {
                    // handle the edge case where the values component is hidden when operator is any
                    if (selectedValue[idx] && !this.isNoValueOperator(selectedOperator[idx])) {
                        const propertyDSL = this.generateDSLForProperty(
                            property,
                            selectedValue[idx],
                            selectedOperator[idx],
                            operators,
                            isFromEvents,
                        );
                        const propertyDSLObject = {};
                        const dslPropertyName = property.dslPropertyName ?
                            property.dslPropertyName :
                            property.id;
                        propertyDSLObject[dslPropertyName] = JSON.parse(propertyDSL);
                        nestedMatchList.push(propertyDSLObject);
                    }
                });
                dsl = {
                    nested_match: {
                        and: nestedMatchList,
                    },
                };
            }
        } else if (selectedPropertyData.nested && forNestedRow) {
            const vars = this.getNestingVarsByRowId(rowId);
            let nestedMatchList = [];
            const dataForNesting = selectedPropertyData[vars.nestedListUniqueId] ?
                selectedPropertyData[vars.nestedListUniqueId] :
                selectedPropertyData.nested;
            dataForNesting.forEach((property, idx) => {
                // handle the edge case where the values component is hidden when operator is any
                if (selectedValue[idx]) {
                    const propertyDSL = this.generateDSLForProperty(
                        property,
                        selectedValue[idx],
                        selectedOperator[idx],
                        operators,
                    );
                    const propertyDSLObject = {};
                    propertyDSLObject[property.id] = JSON.parse(propertyDSL);
                    nestedMatchList.push(propertyDSLObject);
                }
            });
            dsl = {
                nested_match: {
                    and: nestedMatchList,
                },
            };
        }

        if (
            selectedPropertyData.custom &&
            selectedPropertyData.dslPropertyName !== "UserCustomPropertyNames"
        ) {
            return {
                propId: "UserCustomProperties",
                dsl: {
                    nested_match: {
                        and: [{
                            [selectedPropertyData.id]: dsl
                        }],
                    },
                },
            };
        }

        return {
            propId: selectedPropertyData.dslPropertyName ?
                selectedPropertyData.dslPropertyName : selectedPropertyData.id,
            dsl,
        };
    },

    parseScreenFilterValue: function(value) {
        // The context data is identical for all the selected screens,
        // so we take this data from the first one
        const firstScreenData = JSON.parse(value[0]);
        const result = {
            appId: firstScreenData["appId"],
            platform: firstScreenData["platform"],
            screenName: [],
        };

        // Add all the selected screen names to the result data
        for (let i = 0; i < value.length; i++) {
            result["screenName"].push(JSON.parse(value[i])["screenName"]);
        }

        return JSON.stringify(result);
    },

    getDSL: function(predicateComposition) {
        const [propertiesDSL, groupType] = this.createCombinedDSL(
            predicateComposition.predicate,
            this.uxaDSLConstants.properties,
            this.uxaDSLConstants.operators,
            false,
            predicateComposition.predicate.groupType,
        );
        const concatenatedDSL = propertiesDSL
            .map((prop) => {
                let propDSL;
                if (!prop.dsl["simple_match"]) {
                    propDSL = {
                        [prop.propId]: prop.dsl,
                    };
                } else {
                    return prop.dsl["simple_match"]
                        .map((dslItem) => JSON.stringify(dslItem))
                        .join(",");
                }
                return JSON.stringify(propDSL);
            })
            .join(",");

        const dsl = `{"${groupType.toLowerCase()}":[${concatenatedDSL}]}`;
        const parsedDSL = JSON.parse(dsl);
        return parsedDSL;
    },

    type: 'UXALegacyPredicateProcessor'
};
