function manualCreateCIUtil(proxyArg, params) {
    const { api, event, helpers, imports } = params;
    const FORM_ICONS = {
        LOCKED: {
            "statuses": [
                {
                    "type": "icon",
                    "icon": "lock-outline"
                }
            ],
            "disabled": true
        },
        EDITING: {
            "statuses": [
                {
                    "type": "icon",
                    "icon": "circle-semi-check-outline"
                }
            ],
            "disabled": false
        },
        DONE: {
            "statuses": [
                {
                    "type": "icon",
                    "icon": "circle-check-outline"
                }
            ],
            "disabled": false
        }
    };

    const IRE_ACTIONS = {
        IDENTIFY: "identify",
        INSERT: "insert"
    };


    const REL_DEF_LIST_DEFAULT = {
        SELECTED_PAGE: 0,
        PAGE_SIZE: 5
    };

    const OPERATIONAL_STATUS = {
        DESIGN: 900
   };

    const navigateToView = (leftNavItems, newIndex) => {
        if (newIndex < 0 || newIndex > leftNavItems.length - 1)
            return;
        const viewData = leftNavItems[newIndex];
        api.setState('selectedTabTitle', viewData.label);
        api.setState('selectedTabId', viewData.id);
        api.setState('leftNavSelectedItem', [[viewData.id]]);
        api.setState('leftNavItems', leftNavItems);

        let continueBtnDisabled = true;
        let {
           dependencyState,
           processSingleRule,
           selectedRules,
           tempSelectedClass,
           userPayload
        } = api.state;

        if(viewData.id != "select_class") { 
            const {
                 isDependent,
                 table,
                 sectionLabel,
              } = api.data?.get_class_details?.result;

              if (!userPayload.attributes.hasOwnProperty(table)) {
                  api.setState("userPayload", { "attributes": { [table]: { fields: {}, additionalFields: {}, lookup: false, tableLabel: sectionLabel } }, "relations": [] });
              }
              var mandatoryFieldsPopulated =  mandatoryFieldCheck();
             
              continueBtnDisabled = ( isDependent) ?  (!dependencyState.selectedDependentCi || !dependencyState.selectedDependentClass || !mandatoryFieldsPopulated) : !mandatoryFieldsPopulated;
       } else {
                 continueBtnDisabled = (tempSelectedClass == null || tempSelectedClass == "");
       }

       helpers.timing.setTimeout(() => {
            var focusElement = viewData.focusElementId;
            if(helpers && helpers.focus && focusElement) {
                 helpers.focus(focusElement);
            }
        }, 500);

        api.setState('navButtonState', {
            back: {
                hidden: newIndex === 0,
                disabled: false
            },
            continue: {
                hidden: newIndex === leftNavItems.length - 1,
                disabled:  continueBtnDisabled
            },
            create: {
                hidden: newIndex !== leftNavItems.length - 1,
                disabled: false
            }
        });
    };

    const goBackToPrevStep = (leftNavItems, currentViewIndex, FORM_ICONS) => {
         // Mark current step as locked
            leftNavItems[currentViewIndex] = {
                ...leftNavItems[currentViewIndex],
                ...FORM_ICONS.LOCKED
            };
            let prevIndex = currentViewIndex - 1;
            //as long as previous index exists
           if (leftNavItems[prevIndex].statuses.length > 0 && leftNavItems[prevIndex].statuses[0].icon !== FORM_ICONS.EDITING.statuses[0].icon) {
                leftNavItems[prevIndex] = {
                    ...leftNavItems[prevIndex],
                    ...FORM_ICONS.EDITING
                };
           }
           navigateToView(leftNavItems, prevIndex);
  };

    const markCurrStepDone = (leftNavItems, currentViewIndex, FORM_ICONS) => {
            // Mark current step as done
           
            leftNavItems[currentViewIndex] = {
                ...leftNavItems[currentViewIndex],
                ...FORM_ICONS.DONE
            };
            let nextIndex = currentViewIndex + 1;
            // Mark next step as editing as long as it exists and it's not already marked done
            if (nextIndex <= leftNavItems.length - 1 && leftNavItems[nextIndex].statuses.length > 0 && leftNavItems[nextIndex].statuses[0].icon !== FORM_ICONS.DONE.statuses[0].icon) {
                leftNavItems[nextIndex] = {
                    ...leftNavItems[nextIndex],
                    ...FORM_ICONS.EDITING
                };
            }
           navigateToView(leftNavItems, nextIndex);
   }; 

    const getRelRowDefinitions = (relationships, page, pageSize, rowSelectionObj = {}) => {
        let rels = [];
        for (let i = page * pageSize; i < Math.min(relationships.length, (page + 1) * pageSize); i++) {
            const rel = relationships[i];
            let row = {
                type: 'default',
                isSelected: rowSelectionObj[rel.key] || false,
                key: rel.key,
                cells: {
                    child: {
                        value: rel.child.displayValue
                    },
                    parent: {
                        value: rel.parent.displayValue
                    },
                    rel_type: {
                        value: rel.relType.displayValue
                    },
                }
            };
            rels.push(row);
        }
        return rels;
    };

    const initializeAdditionalFields = (additional_attributes) => {
         //additional_attributes come in array format from the data broker
         //we need to convert it into json format to be initialized into userPayload
         if (!Array.isArray(additional_attributes)) {
               return {};
         }

         let keyAttribute = "element"; //all elements are unique 
         let results =  additional_attributes.reduce((result, current) => {         
                if (!(keyAttribute in current)) {
                    throw new Error(`Key attribute '${keyAttribute}' not found in object: ${JSON.stringify(current)}`);
                 }

                 const transformedObj = {...current};
                  if ('defaultValueLabel' in transformedObj) {
                       transformedObj.displayValue = transformedObj.defaultValueLabel;
                       delete transformedObj.defaultValueLabel;
                   }

                  if ('defaultValue' in transformedObj && transformedObj.defaultValue != null && transformedObj.defaultValue != "" ) {
                       transformedObj.value = transformedObj.defaultValue;
                       delete transformedObj.defaultValue;
                       const key = transformedObj[keyAttribute];
                       result[key] = transformedObj;
                  }

                  return result;
         }, {});
         return results;
    };

    const processSelectedRules = (selectedRulesArr, useUserPayloadParam, userPayloadParam) => {
        let {
            mandatory_fields,
            additional_attributes : additionalAttrFields,
            table: mainTable,
            sectionLabel: mainTableLabel,
            isDependent
        } = api.data.get_class_details.result;

        let selectedRules = [], tableFields = [];
        let {
            navButtonState,
            dependencyState,
            userPayload: _userPayload,
            selectedTabId,
            leftNavItems, 
            initialUserPayload,
            tableFields: oldTableFields
        } = api.state;

        if(useUserPayloadParam == true) {
            _userPayload = userPayloadParam;
        }

        if (selectedRulesArr.length > 0) {
            const newTableFields = _buildTableFields(mainTable, mainTableLabel, selectedRulesArr, mandatory_fields);
            const changes = _evaluateChangeInTableFields(oldTableFields, newTableFields);
            const {
                tableFields,
                userPayload
            } = _syncChangesWithCurrentState(changes, _userPayload, oldTableFields);
            selectedRulesArr.forEach((currRule) => {
                selectedRules.push(currRule.id);
            });

            //if main table isn't at the first of the array, find it and and move it to the first of the array
            if (tableFields[0].table != mainTable) {
                tableFields.forEach(function (item, i) {
                    if (item.table === mainTable) {
                        tableFields.splice(i, 1);
                        tableFields.unshift(item);
                    }
                });
            }

            //de-dupe the tableFields for additionalAttrFields, only if there were fields from mainTable in the tableFields payload
            let filteredAdditionalFields = [];
            if (tableFields[0].table == mainTable) {
                const mainTableFieldsArr = tableFields[0].fieldsArr[0].fields;
                const additionalFieldsPayload = userPayload.attributes[mainTable].additionalFields;
                filteredAdditionalFields = additionalAttrFields.filter(function (item) {
                    //find and filter this additional field was already in tableFields
                    if (mainTableFieldsArr.find(({ element }) => element === item.element)) {
                        // also delete it from userPayload if already exists
                        if(additionalFieldsPayload && Object.keys(additionalFieldsPayload).length > 0 && Object.keys(additionalFieldsPayload).includes(item.element)) {
                            delete userPayload.attributes[mainTable].additionalFields[item.element];
                        }
                        return false;
                    }
                    return true;
                });
            }

            api.setState("tableFields", tableFields);
            api.setState("userPayload", userPayload);
            const allAdditionalFields = filteredAdditionalFields.length? filteredAdditionalFields : additionalAttrFields;

            const lifeCycleFields = [];
            const otherAdditionalFields = [];

            for (const field of allAdditionalFields) {
               if (["life_cycle_stage", "life_cycle_stage_status"].includes(field.element))
                     lifeCycleFields.push(field);
              else
                   otherAdditionalFields .push(field);
            }

           api.setState("lifeCycleFields", lifeCycleFields);
           api.setState("additionalAttrFields", otherAdditionalFields);

           if (selectedTabId == "select_class") {
                //if we're processing rules and we're still in "select_class" tab, mark it done and move to next step. 
                //this can happen when a class with single rule was selected in "select class" step
                let currViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);
                markCurrStepDone(leftNavItems, currViewIndex, FORM_ICONS);
                navButtonState['continue'].disabled = true;
           } else {
               // only do mandatory check and update continue btn state if selectedTabId is not "select_class"
               updateContinueButtonState(userPayload);
           }
           
        } else {
            //when 0 rules are selected, disable continue button and reset tableFields to empty array, userPayload to initial value
            navButtonState['continue'].disabled = true;
            api.setState("tableFields", []);
            api.setState('additionalAttrFields', []);
            api.setState("userPayload", initialUserPayload); 
        }
        
        api.setState("selectedRules", selectedRules);
        api.setState("navButtonState", JSON.parse(JSON.stringify(navButtonState)));
    };

    const _buildTableFields = (mainTable, mainTableLabel, selectedRules, mandatoryFields = []) => {
        const result = [];

        const _sectionLabelConfig = {
            variant: "primary",
            weight: "normal",
            size: "md"
        };

        if (mandatoryFields.length > 0) {
            result.push({
                table: mainTable,
                lookup: false,
                label: {
                    label: mainTableLabel,
                    ..._sectionLabelConfig
                },
                fieldsArr: [{ fields: JSON.parse(JSON.stringify(mandatoryFields)) }]
            });
        }

        selectedRules.forEach(rule => {
            rule.tableMetadata.forEach(metadata => {
                const existingTable = result.find(entry => entry.table === metadata.table);
    
                if (existingTable) {
                    metadata.fields.forEach(field => {
                        if (!existingTable.fieldsArr[0].fields.some(existingField => existingField.element === field.element)) {
                            existingTable.fieldsArr[0].fields.push(field);
                        }
                    });
                } else {
                    const newEntry = {
                        table: metadata.table,
                        lookup: metadata.lookup,
                        filterFieldInfo: metadata.filterFieldInfo,
                        label: {
                            label: metadata.sectionLabel,
                            ..._sectionLabelConfig
                        },
                        fieldsArr: [{ fields: [...metadata.fields] }],
                    };
                    if (metadata.lookup) {
                        newEntry.addLookupBtnLabel = metadata.addLookUpButtonLabel;
                        newEntry.removeLookupBtnLabel = metadata.removeLookUpButtonLabel;
                    }
                    result.push(newEntry);
                }
            });
        });

        // Sort the fields such that all the filter fields are grouped together at the end
        result.forEach(entry => {
            let isFirstOccurenceOfFilterField = true;
            entry.fieldsArr[0].fields.sort((a, b) => {
                if (a.filterField === b.filterField) {
                    return 0;
                }
                return a.filterField ? 1 : -1;
            });
            entry.fieldsArr[0].fields.forEach(field => {
                if (field.filterField) {
                    if (isFirstOccurenceOfFilterField) {
                        isFirstOccurenceOfFilterField = false;
                        field.filterFieldInfo = entry.filterFieldInfo;
                    } else {
                        field.filterFieldInfo = null;
                    }
                }
            });
        });
        return result;
    };

    const _evaluateChangeInTableFields = (oldTableFields = [], newTableFields = []) => {
        const findTable = (metadata, tableName) => metadata.find(entry => entry.table === tableName);
        const findField = (fields, elementName) => fields.find(field => field.element === elementName);

        const changes = {
            added: {},
            removed: {}
        };

        // Check for added and modified tables/fields
        newTableFields.forEach(({table, fieldsArr, ...other}) => {
            const oldTable = findTable(oldTableFields, table);

            let addedFields = {};
            if (!oldTable) {
                // Entire table added
                addedFields = fieldsArr[0].fields.reduce((acc, field) => {
                    acc[field.element] = field;
                    return acc;
                }, {});
            } else {
                // Check for added fields 
                addedFields = fieldsArr[0].fields.filter(newField => !findField(oldTable.fieldsArr[0].fields, newField.element)).reduce((acc, field) => {
                    acc[field.element] = field;
                    return acc;
                }, {});
            }

            if (Object.keys(addedFields).length > 0) {
                changes.added[table] = {
                    table,
                    ...other,
                    fields: addedFields
                };
            }
        });

        // Check for removed tables/fields
        oldTableFields.forEach(({table, fieldsArr, ...other}) => {
            const newTable = findTable(newTableFields, table);

            let removedFields = {};
            if (!newTable) {
                // Entire table removed
                removedFields = fieldsArr[0].fields.reduce((acc, field) => {
                    acc[field.element] = field;
                    return acc;
                }, {});
            } else {
                // Check for removed fields
                removedFields = fieldsArr[0].fields.filter(oldField => !findField(newTable.fieldsArr[0].fields, oldField.element)).reduce((acc, field) => {
                    acc[field.element] = field;
                    return acc;
                }, {});
            }

            if (Object.keys(removedFields).length > 0) {
                changes.removed[table] = {
                    table,
                    ...other,
                    fields: removedFields
                };
            }
        });

        return changes;
    }

    const _syncChangesWithCurrentState = (tableFieldChanges, userPayload, tableFields) => {
        const { added, removed } = tableFieldChanges;
        let _userPayload = JSON.parse(JSON.stringify(userPayload));
        let _tableFields = JSON.parse(JSON.stringify(tableFields));
        const _initField = ({ label, defaultValue, defaultValueLabel, mandatory }) => ({ 
            label, 
            value : defaultValue, 
            displayValue : defaultValueLabel,
            mandatory
        });

        for (const table in added) {
            const { fields: addedFields, lookup, label, ...other } = added[table];

            // add the newly added table to userPayload if it doesn't exist
            if (!_userPayload.attributes[table]) {
                _userPayload.attributes[table] = {
                    ...other,
                    fields: lookup ? [] : {},
                    tableLabel: label.label,
                    lookup,
                };
            }
            // initailize the fields to be added to userPayload
            const _addedUserPayloadFields = Object.keys(addedFields).reduce((acc, field) => {
                acc[field] = _initField(addedFields[field]);
                return acc;
            }, {});

            if (lookup) {
                if (_userPayload.attributes[table].fields.length == 0) {
                    _userPayload.attributes[table].fields.push(_addedUserPayloadFields);
                } else {
                    _userPayload.attributes[table].fields = _userPayload.attributes[table].fields.map((f) => {
                        return { ...f, ..._addedUserPayloadFields };
                    });
                }
            } else {
                _userPayload.attributes[table].fields = { ..._userPayload.attributes[table].fields, ..._addedUserPayloadFields };
            }

            // add table to the tableFields if it doesn't exist
            let _tableEntry = _tableFields.find(({ table: _table }) => _table === table);
            if (!_tableEntry) {
                _tableEntry = {
                    ...other,
                    table,
                    lookup,
                    label,
                    fieldsArr: [{ fields: Object.values(addedFields) }]
                };
                _tableFields.push(_tableEntry);
            } else {
                const _existingFields = _tableEntry.fieldsArr[0].fields.map((field) => field.element);
                const _addedFields = [];
                Object.values(addedFields).forEach((field) => {
                    if (!_existingFields.includes(field.element)) {
                        _addedFields.push(field);
                    }
                });
    
                if (_addedFields.length > 0) {
                    _tableEntry.fieldsArr.forEach((elm) => {
                        elm.fields = elm.fields.concat(_addedFields);
                    });
                }
            }
        }

        for (const table in removed) {
            const { fields, lookup, ...other } = removed[table];
            // for each table or field that were removed, remove it from userPayload
            if (_userPayload.attributes[table]) {
                if (lookup) {
                    _userPayload.attributes[table].fields = _userPayload.attributes[table].fields.map((f) => {
                        for (const field in fields) {
                            if (f[field]) {
                                delete f[field];
                            }
                        }
                        return f;
                    }).filter((f) => {
                        return Object.keys(f).length > 0;
                    });
                } else {
                    for (const field in fields) {
                        delete _userPayload.attributes[table].fields[field];
                    }
                }

                // if all fields were removed, remove the table from userPayload
                if (_userPayload.attributes[table].fields.length == 0) {
                    delete _userPayload.attributes[table];
                }
            }

            // for each table or field that were removed, remove it from tableFields
            const _tableEntry = _tableFields.find(({ table: _table }) => _table === table);
            if (_tableEntry) {
                _tableEntry.fieldsArr.forEach((elm) => {
                    elm.fields = elm.fields.filter((field) => {
                        return !fields[field.element];
                    });
                });

                // if all fields were removed, remove the table from tableFields
                _tableEntry.fieldsArr = _tableEntry.fieldsArr.filter((elm) => elm.fields != null && elm.fields.length > 0);
                if (_tableEntry.fieldsArr.length == 0) {
                    _tableFields = _tableFields.filter((entry) => entry.table !== table);
                }
            }
        }

        return {
            userPayload: _userPayload,
            tableFields: _tableFields
        };
    }

   // Function to rename keys 
    const renameKey = (obj, oldKey, newKey) => {
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
        return obj;
    };

    const transformUserPayload = (userPayload, selectedClass) => {
        //userPayload contains more metadata than what IRE really needs, this extra metadata is necessary for the "review" page. 
        //Before calling sendToIRE api, transform the userPayload to a format that is being expected by sendToIRE

        var finalUserPayload = {};
        var attrs = Object.keys(userPayload.attributes);
        var finalAttrs = {}; 
        attrs.map( (obj) => {
            finalAttrs[obj] = {
                'lookup' : userPayload.attributes[obj].lookup,
                'fields' : {}
            };
            if (userPayload.attributes[obj].lookup) {
                finalAttrs[obj].fields = [];
                userPayload.attributes[obj].fields.forEach((lookup) => {
                    var lookupObj = {};
                    Object.keys(lookup).forEach((item) => {
                        lookupObj[item] = lookup[item].value;
                    });
                    finalAttrs[obj].fields.push(lookupObj);
                });
            } else {
                Object.keys(userPayload.attributes[obj].fields).forEach((item) => {
                    finalAttrs[obj].fields[item] = userPayload.attributes[obj].fields[item].value;
                });

               Object.keys(userPayload.attributes[obj].additionalFields).forEach((item) => {
                    finalAttrs[obj].fields[item] = userPayload.attributes[obj].additionalFields[item].value;
                });
                
                // replace the table with selected class at the end before passing to IRE, only if obj != selectedClass
                if (obj != selectedClass) {
                    renameKey(finalAttrs, obj, selectedClass);
                }
            }
        });
        finalUserPayload.attributes = finalAttrs;

        var transformedRelations = JSON.parse(JSON.stringify(userPayload.relations));
        transformedRelations.forEach((rel, i) => {
            if (rel.hasOwnProperty("isDependentRel") && rel.isDependentRel == true) {
                return;
            }
            if (rel.relType) {
               transformedRelations[i].relType = rel.relType.value;
            }
            if (rel.isParent) {
                transformedRelations[i].sysId = rel.child.value;
                transformedRelations[i].className = rel.child.className;
            } else {
                transformedRelations[i].sysId = rel.parent.value;
                transformedRelations[i].className = rel.parent.className;
            }
        });
        finalUserPayload.relations = transformedRelations;
        return finalUserPayload;
   };

    const mandatoryFieldCheck = (currUserPayload) => {
        let {
            userPayload,
            mandatoryFields,
            mainTable
        } = api.state;
        
        userPayload = currUserPayload || userPayload;

        if (Object.keys(userPayload).length == 0) {
            return false;
        }
        
        var mandatoryFieldsPopulated = true;
        for(const tableKey in mandatoryFields) {
           if(userPayload.attributes.hasOwnProperty(tableKey) && userPayload.attributes[tableKey].hasOwnProperty("fields")) {
               for (const field in mandatoryFields[tableKey]) {
                   if (!userPayload.attributes[tableKey].fields.hasOwnProperty(field) || (userPayload.attributes[tableKey].fields[field].value == "" || userPayload.attributes[tableKey].fields[field].value ==null)) {
                       mandatoryFieldsPopulated = false;
                   }
               }
            }
         }

        // mandatoryFields and at least some user fields must be populated
        if (!mandatoryFieldsPopulated) {
            return mandatoryFieldsPopulated;
        } 

        //check for population of at least some userPayload fields
        var someFieldsPopulated = false;

	    if (Object.keys(userPayload.attributes).length > 0) {
			for (const prop in userPayload.attributes) {
				if (prop == mainTable) { 
					if (Object.keys(userPayload.attributes[prop].fields).length > 0) {
						for (const field in userPayload.attributes[prop].fields) {
							if (userPayload.attributes[prop].fields[field].value != null && userPayload.attributes[prop].fields[field].value != "") {
								someFieldsPopulated = true;
							}
						}
					} 
				} else {
					//for lookup tables, we have to check for each set of lookup entry to see some values being populated
					//the tricky part is that there are field types with default values which will always be populated. 
					for(const fieldSet of userPayload.attributes[prop].fields) { 
						for (const field in fieldSet) {
						    if(fieldSet[field].mandatory === true && (fieldSet[field].value == null || fieldSet[field].value == ""))
						        return false;
							if(fieldSet[field].value != null && fieldSet[field].value != "") {
								someFieldsPopulated = true;
							}
						}
					}
				}
			}
		} 

	    return someFieldsPopulated;
    };

    const handleRelListFilterChange = async (filter) => {
        let originalFilter = filter;
        const orderBySysId = "ORDERBYsys_id";
        filter = filter.replace(orderBySysId, "").slice(0, -1); //this will remove the character ORDERBYsys_id and a char before that which can be either ^ or =
        //we don't want to include the ORDERBYsys_id in the condition count

        let conditionCount = filter.length ? filter.split('^').length : 0;
        const headerLabel = await helpers.translate('Filters');
        const captionLabel = conditionCount == 1 ? await helpers.translate('1 condition applied') : await helpers.translate('{0} conditions applied', conditionCount);
        
        api.setState('relProps', ({currentValue}) => {
            const {
                accordion: {
                    header,
                    caption
                }
            } = currentValue;
            return { 
                ...currentValue, 
                listControllerFilter: originalFilter,
                accordion: {
                    expanded: false,
                    header: {
                        ...header,
                        label: headerLabel
                    },
                    caption: {
                        ...caption,
                        label: captionLabel
                    }
                }    
            };
        });
    };
    
    const setDependentCiRelationship = async (ciSysId, ciDisplayValue) => {
        let {
            dependencyState,
            dependentCiValue,
            tableFields,
            navButtonState,
            userPayload,
            labelsTooltips,
            defaultContinueBtnTooltip,
            mainTable
        } = api.state;

        let {
            is_reverse,
            role
        } = dependencyState.selectedDependentObj;

        if(ciSysId != dependencyState.selectedDependentCi && ciSysId != null) { //only needs to update if the new CI selected is different from the old one
            dependencyState.selectedDependentCi = ciSysId;

            let relObj = {
                'type': "cmdb_rel_ci",
                'relType': dependencyState.selectedDependentObj.relTypeSysId,
                'relationshipType' : dependencyState.selectedDependentObj.relationship,
                'className': dependencyState.selectedDependentClass,
                'classLabel': dependencyState.selectedDependentObj.label,
                'sysId' : ciSysId,
                'ciLabel' : ciDisplayValue,
                'isParent': is_reverse ? role == "child" : role == "parent",
                'isDependentRel' : true
            };
            
            if(userPayload.relations.length ==0) {
                userPayload.relations.push(relObj);
            } else {
                userPayload.relations[0] = relObj;
            }

            api.setState("userPayload", userPayload);

            //check to see if any rules are selected and attributes are filled
            if (tableFields.length > 0 && mandatoryFieldCheck()) {
                navButtonState['continue'].disabled = false;
                labelsTooltips.continueBtnTooltip = defaultContinueBtnTooltip;
            }
        } else if (ciSysId == null) {
            dependencyState.selectedDependentCi = null;
            if(userPayload.relations.length ==1) { //if there's an existing 
                userPayload.relations.pop();
                navButtonState['continue'].disabled = true;
                labelsTooltips.continueBtnTooltip = await helpers.translate("You must select a dependent-upon class and CI");

            }
        }

        api.setState("dependencyState", dependencyState);
        api.setState("dependentCiValue", ciDisplayValue);

        api.setState("navButtonState", JSON.parse(JSON.stringify(navButtonState)));
        api.setState("labelsTooltips,", labelsTooltips);
    };

    const updateUserPayload = (event) => {
        const {
            FIELD_TYPES
        } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

        let {
            leftNavItems,
            selectedTabId,
            userPayload,
            mainTable,
        } = api.state;

        userPayload = {...userPayload};

        if (event.elementId == "additional_attr_mcc_field_renderer" || event.elementId  == 'life_cycle_stage_fields') {
            let {
                field,
                value
            } = event.payload;

            let {
                value : fieldDetails
            } = event.context.item;
            
            let displayValue = event.payload?.displayValue || value;

            if (userPayload.attributes.hasOwnProperty(mainTable)) {
                userPayload.attributes[mainTable].additionalFields[field] = {
                    'label' : fieldDetails.label,
                    'value' : value,
                    'displayValue' : displayValue,
                    'internalType' : fieldDetails.type,
                    'referenceTable': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceTable : null,
                    'referenceKey': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceKey: null
                };
            } else {
                userPayload.attributes[mainTable] = {
                    'lookup' : false,
                    'tableLabel' : mainTable,
                    'additionalFields' : { [field] : { 'label' : fieldDetails.label, 'value' : value, 'displayValue' : displayValue, 'internalType' : fieldDetails.type, 'referenceTable': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceTable : null, 'referenceKey': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceKey: null} }
                };
            }
        } else {
            let {
                table,
                lookup,
                label
            } = event.context.item.parent.parent.value;

            let {
                value : fieldDetails
            } = event.context.item;

            let {
                field,
                value
            } = event.payload;

            let displayValue = event.payload?.displayValue || value;

            var index = event.context.item.parent.index;

            if (userPayload.attributes.hasOwnProperty(table)) {
                if(lookup) {
                    //before inserting, let's make sure the current array is big enough to hold this new entry for the new index
                    if(userPayload.attributes[table].fields && userPayload.attributes[table].fields.length > 0) {
                        var currLength = userPayload.attributes[table].fields.length;
                        if(index >= currLength) {
                            for(var i = index; i < currLength+1; i++) {
                                userPayload.attributes[table].fields.push({});
                            }
                        }
                    } 
                    userPayload.attributes[table].fields[index][field] = {
                        'label' : fieldDetails.label,
                        'value' : value,
                        'displayValue' : displayValue,
                        'internalType' : fieldDetails.type,
                        'mandatory': fieldDetails.mandatory,
                        'referenceTable': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceTable : null,
                        'referenceKey': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceKey: null
                    };
                } else {
                    //Not a lookup, just overwrite the field value
                    userPayload.attributes[table].fields[field] = {
                        'label' : fieldDetails.label,
                        'value' : value,
                        'displayValue' : displayValue,
                        'internalType' : fieldDetails.type,
                        'mandatory': fieldDetails.mandatory,
                        'referenceTable': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceTable : null,
                        'referenceKey': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceKey: null
                    };
                }
                
            } else {
                userPayload.attributes[table] = {
                    'lookup' : lookup,
                    'tableLabel' : label.label,
                    'fields' : [],
                    'additionalFields': []
                };
                if (lookup) {
                    //check current fieldsArray length; this would be necessary, if users entered a 3rd or 4th related entry first, before entering the first
                    if(userPayload.attributes[table].fields && userPayload.attributes[table].fields.length > 0) {
                        var currLength = userPayload.attributes[table].fields.length;
                        if(index > currLength-1) {
                            for(var i = index; i < currLength; i++) {
                                userPayload.attributes[table].fields.push({});
                            }
                        }
                    } 
                    userPayload.attributes[table].fields[index] = { 
                        [field] : { 
                            'label' : fieldDetails.label, 
                            'value' : value, 
                            'displayValue' : displayValue, 
                            'internalType' : fieldDetails.type,
                            'mandatory': fieldDetails.mandatory,
                            'referenceTable': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceTable : null,
                            'referenceKey': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceKey: null
                        }
                    };
                } else {
                    userPayload.attributes[table].fields = { 
                        [field] : { 
                            'label' : fieldDetails.label, 
                            'value' : value, 
                            'displayValue' : displayValue, 
                            'internalType' : fieldDetails.type,
                            'mandatory': fieldDetails.mandatory,
                            'referenceTable': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceTable : null,
                            'referenceKey': fieldDetails.type === FIELD_TYPES.REFERENCE ? fieldDetails.referenceKey: null
                        } 
                    };
                }      
            }
            
            updateContinueButtonState(userPayload);
        }
    
        let currentViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);

        let newNavItems = leftNavItems.map((item, index) => {
            if (index > currentViewIndex) {
                item = {
                    ...item,
                    ...FORM_ICONS.LOCKED
                };
            }
            return item;
        });
        const viewData = newNavItems[currentViewIndex];
        api.setState('leftNavItems', newNavItems);

        api.setState("userPayload", userPayload);
    };
    
    const updateContinueButtonState = (userPayload) => {
        const {
            navButtonState,
            dependencyState,
            defaultContinueBtnTooltip,
            labelsTooltips
        } = api.state;
        
        const {
            isDependent
        } = api.data.get_class_details.result;
        
        var mandatoryFieldsPopulated = mandatoryFieldCheck(userPayload);

        var buttonDisabled = ( isDependent) ?  ( !dependencyState.selectedDependentCi || !dependencyState.selectedDependentClass || !mandatoryFieldsPopulated) :  !mandatoryFieldsPopulated;
        navButtonState['continue'].disabled = buttonDisabled;
        
        if(!buttonDisabled) {
            labelsTooltips.continueBtnTooltip = defaultContinueBtnTooltip;
        }
        api.setState("navButtonState", JSON.parse(JSON.stringify(navButtonState)));
        api.setState("labelTooltips", labelsTooltips);
        return buttonDisabled;
    };

    const resetFormExceptSelectClass = () => {
        api.setState('tableFields', []);
        api.setState('userPayload', {
            attributes: {},
            relations: []
        });
        api.setState('selectedRules', []);
        api.setState('disableRuleSelection', false);
        api.setState('dependentCiValue', '');
        api.setState('identifyCiExstingSysId', '');
        api.setState('identifyCiExistingCiClass', '');
        api.setState('listControllerTable', '');
        api.setState('listControllerFilter', '');
        api.setState('listControllerSortApplied', false);
        api.setState('mandatoryFields', {});
        api.setState('ireError', {});
        api.setState('reviewData', []);
        api.setState('resultSummary', {});
        api.setState('relProps', ({currentValue}) => {
            return {
                ...currentValue,
                cbEncodedQuery: null,
                hideRelTypes: {
                    ci: false,
                    group: false,
                    user: false
                },
                relTypeSelectedItem: {},
                relationships: [],
                rowDefinitions: {
                    rows: []
                },
                rowSelectionObj: {},
                selectedPage: 0,
                stagedRels: []
            };
        });
    };

    return {
        FORM_ICONS,
        IRE_ACTIONS,
        REL_DEF_LIST_DEFAULT,
        OPERATIONAL_STATUS,
        navigateToView,
        getRelRowDefinitions,
        processSelectedRules,
        initializeAdditionalFields,
        handleRelListFilterChange,
        mandatoryFieldCheck,
        markCurrStepDone,
        goBackToPrevStep,
        transformUserPayload,
        setDependentCiRelationship,
        updateUserPayload,
        updateContinueButtonState,
        resetFormExceptSelectClass
    }
}
