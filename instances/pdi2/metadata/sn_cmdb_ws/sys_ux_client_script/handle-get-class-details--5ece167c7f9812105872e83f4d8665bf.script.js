/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        FORM_ICONS,
        navigateToView,
        markCurrStepDone,
        goBackToPrevStep,
        initializeAdditionalFields,
        processSelectedRules
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);

    const {
        WARNING_NOTIFICATION_PROPS,
        showNotificationWithAutoClose
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();

    const {
        FIELD_TYPES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const {
        identification_rules,
        isDependent,
        table,
        sectionLabel,
        headingText,
        mandatory_fields,
        additional_attributes,
        refCiMetadata,
        canWrite,
        canCreate
    } = api.data.get_class_details.result;

    let {
        dependencyState,
        labelsTooltips,
        mandatoryFields,
        userPayload,
        selectedTabId,
        selectedClass,
        navButtonState,
        leftNavItems
    } = api.state;

    let {
        classHierarchy,
        parentCiRefQuery
    } = api.context.props;

    let currViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);
    let reqAttrData = leftNavItems[1];
    let reviewData = leftNavItems[4];
    let processSingleRule = false;
    if (!canWrite || !canCreate) {
        goBackToPrevStep(leftNavItems, currViewIndex, FORM_ICONS);
        helpers.navigate.setRouteParams({'params' : {
            'sysClassName' : ''
        }});

        api.setState("tempSelectedClass", "");

        let notifications = [{
            ...WARNING_NOTIFICATION_PROPS,
            id: 'no-write-access-warningId' + new Date().valueOf(),
            content: await helpers.translate('You do not have access to create records in the {0} class', [api.context.props.sysClassName])
        }];
        showNotificationWithAutoClose({ api, helpers }, notifications);
    } else if(!identification_rules || identification_rules.length == 0) {
        //go back to select_class nav
        goBackToPrevStep(leftNavItems, currViewIndex, FORM_ICONS);
        labelsTooltips.continueBtnTooltip = await helpers.translate("Select a class with at least 1 IRE identifier entry to continue");

        helpers.navigate.setRouteParams({'params' : {
            'sysClassName' : ''
        }});

        api.setState("tempSelectedClass", "");

        let notifications = [{
            ...WARNING_NOTIFICATION_PROPS,
            id: 'warningId' + new Date().valueOf(),
            content: await helpers.translate('The {0} class has 0 IRE identifier entries. Please select a class with at least 1 identifier entry.', [table])
        }];
        showNotificationWithAutoClose({ api, helpers }, notifications);
    } 
    else {
        if (headingText) { 
            api.setState("mainHeading", headingText);
        }
        if(identification_rules.length == 1) {
            api.setState("selectedRules", [identification_rules[0].id]);
            api.setState("disableRuleSelection", true);
            api.setState("processSingleRule", true);
            processSingleRule = true;
            reqAttrData.focusElementId = "navigation_tree";

            labelsTooltips.ruleSelectionLabel = await helpers.translate("Identifier entry (the only one available is pre-selected)");
            labelsTooltips.ruleSelectionTooltip = await helpers.translate("Only 1 set of identifier entry is configured for this class; it is preselected. Enter values for associated attributes.");
        } else {
            reqAttrData.focusElementId = "id_rule_selection_dropdown";
            api.setState("disableRuleSelection", false);
            api.setState("selectedRules", []);
            api.setState("tableFields", []);
            labelsTooltips.ruleSelectionLabel = await helpers.translate("Criterion attributes");
            labelsTooltips.ruleSelectionTooltip = await helpers.translate("Select identifier entries and then enter values for the associated criterion attributes");
            labelsTooltips.continueBtnTooltip = await helpers.translate("You must select at least 1 identifier entry and populate its associated criterion attributes.");
        }

        const additionalFields = initializeAdditionalFields(additional_attributes);
        userPayload = { 
            "attributes": { 
                [table]: { 
                    fields: {}, 
                    additionalFields: additionalFields, 
                    lookup: false, 
                    tableLabel: sectionLabel 
                } 
            }, 
            "relations": [] 
        };

        if (mandatory_fields.length > 0) {
            mandatoryFields = {
                [table] : {}
            };
            mandatory_fields.forEach( (mField) => {
                mandatoryFields[table][mField.element] = false;
                if (mField.hasOwnProperty("defaultValue") && mField.defaultValue != null) { //set default values to userPayload
                    if (mField.hasOwnProperty("defaultValueLabel") && mField.defaultValueLabel != null) {
                        userPayload.attributes[table].fields[mField.element] = {
                            'label' : mField.label, 
                            'value' : mField.defaultValue, 
                            'displayValue': mField.defaultValueLabel, 
                            'internalType' : mField.type,
                            'mandatory': mField.mandatory,
                            'referenceTable': mField.type === FIELD_TYPES.REFERENCE ? mField.referenceTable : null
                        }; 
                    } else {
                        userPayload.attributes[table].fields[mField.element] = {
                            'label' : mField.label, 
                            'value' : mField.defaultValue, 
                            'displayValue': mField.defaultValue, 
                            'internalType' : mField.type,
                            'mandatory': mField.mandatory,
                            'referenceTable': mField.type === FIELD_TYPES.REFERENCE ? mField.referenceTable : null
                        }; 
                    }
                }
            });
        }
        api.setState("mainTable", table);
        api.setState("mandatoryFields", mandatoryFields);
        
        api.setState("initialUserPayload", JSON.parse(JSON.stringify(userPayload))); //so that we don't assign a shallow copy 
        reviewData.focusElementId = "review_req_attrs_accordion";
 
        
        
        var validRefCiMetadata = {
            valid : false
        };
        //if refCiMetadata is not an empty object, set userpayload to have ci reference data
        if(Object.keys(refCiMetadata).length > 0) {
            //this needs to be done whether current CI is independent or dependent
            //save the data in validRefCiMetadata so that it can be reused for dependent CI
            let refField = Object.keys(refCiMetadata.fieldMetadata)[0];
            validRefCiMetadata = {
                valid : true,
                refField : refField,
                refCiName : refCiMetadata.displayValue,
                refCiClass : refCiMetadata.className,
                refLabel: refCiMetadata.fieldMetadata[refField].label,
                refCiSysId : refCiMetadata.ciSysId
            };
            userPayload.attributes[table].fields[validRefCiMetadata.refField] = {
                'label' : validRefCiMetadata.refLabel, 
                'value' : validRefCiMetadata.refCiSysId, 
                'displayValue': validRefCiMetadata.refCiName, 
                'internalType' : 'string'
            }; //purposely setting internalType to string, because for reference fields, we don't want to circle back to previous breadcrumb
        }

        if(isDependent) {
            let classDependencies = api.data?.get_class_details?.result?.dependencies;
            let dependencyArr = classDependencies.map((obj) => ( { 
                'id': obj.name, 
                'label': obj.label, 
                'sublabel': obj.relationship, 
                'relTypeSysId': obj.relTypeSysId,
                'relationship': obj.relationship,
                'role' : obj.role, 
                'is_reverse': obj.is_reverse 
            }));
            var hideNoDependentCiAlert = api.data?.get_class_details?.result?.hideNoDependentCIalert;

            if(validRefCiMetadata.valid) {
                //set the referenced ci as a dependent CI
                var parentObj = dependencyArr.find((obj) => obj.id == validRefCiMetadata.refCiClass);
                if(parentObj!= 'undefined') {
                    api.setState("dependentCiValue", validRefCiMetadata.refCiName);
                    dependencyState = {
                        ...dependencyState,
                        selectedDependentObj : parentObj,
                        selectedDependentClass : validRefCiMetadata.refCiClass,
                        hideDepCiTypeahead : false,
                        dependencies : dependencyArr,
                        selectedDependentCi : validRefCiMetadata.refCiSysId,
                        selectedDependentCiName : validRefCiMetadata.refCiName
                    };

                    //set dependency relationship in the user payload
                    let relObj = {
                        'type': "cmdb_rel_ci",
                        'relType': parentObj.relTypeSysId,
                        'relationshipType' : parentObj.relationship,
                        'className': parentObj.id,
                        'classLabel': parentObj.label,
                        'sysId' : validRefCiMetadata.refCiSysId,
                        'ciLabel' :  validRefCiMetadata.refCiName,
                        'isParent': parentObj.is_reverse ? parentObj.role == "child" : parentObj.role == "parent",
                        'isDependentRel' : true
                    };
                    userPayload.relations.push(relObj);
                }
                labelsTooltips.continueBtnTooltip = await helpers.translate('You must select and populate at least 1 associated criterion attribute');
                 
                if(dependencyArr.length == 1) {
                    dependencyState.hideNoDependentCIAlert = (hideNoDependentCiAlert == undefined || hideNoDependentCiAlert == null) ? true : hideNoDependentCiAlert;
                    dependencyState.classSelectDisabled = true;
                } else {
                    dependencyState.hideNoDepRelsAlert = !(dependencyArr.length == 0);
                    dependencyState.classSelectDisabled = false;
                    dependencyState.hideNoDependentCIAlert = true;
                }

            } else {
                if(dependencyArr.length == 1) {
                    //if there's only 1 dependency, pre-select and disable it
                    dependencyState = {
                        ...dependencyState,
                        selectedDependentObj : dependencyArr[0],
                        selectedDependentClass : dependencyArr[0].id,
                        dependencies : dependencyArr,
                        classSelectDisabled : true,
                        hideDepCiTypeahead : false,
                        hideNoDependentCIAlert : (hideNoDependentCiAlert == undefined || hideNoDependentCiAlert == null) ? true : hideNoDependentCiAlert
                    };
                    reqAttrData.focusElementId = "dep_ci_typeahead_preset";

                    labelsTooltips.dependentClassLabel = await helpers.translate('Dependent-upon class (the only one available is pre-selected)');
                    labelsTooltips.dependentClassTooltip = await helpers.translate('Only 1 dependent-upon class is available for you; it is pre-selected.');
                } else {
                    dependencyState.hideNoDepRelsAlert = !(dependencyArr.length == 0);
                    dependencyArr.unshift({
                        id: "",
                        label : await helpers.translate("Select Dependent-upon class")
                    });

                    
                    dependencyState = {
                        ...dependencyState,
                        selectedDependentObj : dependencyArr[0],
                        selectedDependentClass : dependencyArr[0].id,
                        dependencies : dependencyArr,
                        classSelectDisabled : false,
                        hideDepCiTypeahead : true,
                        hideNoDependentCIAlert: true
                    };

                    if(identification_rules.length > 1) {
                        labelsTooltips.continueBtnTooltip = await helpers.translate('You must select a dependent-upon class and CI, and select and populate at least 1 associated criterion attribute');
                    } else {
                        labelsTooltips.continueBtnTooltip = await helpers.translate('You must select a dependent-upon class and CI');
                    }

                    reqAttrData.focusElementId = "dependent_ci_class_select";
                    labelsTooltips.dependentClassLabel = await helpers.translate('Dependent-upon class');
                    labelsTooltips.dependentClassTooltip = await helpers.translate('Select a parent class for the dependent-upon CI');
                }
            }

            reviewData.focusElementId = "review_dep_ci_accordion";
            api.setState("dependencyState", JSON.parse(JSON.stringify(dependencyState)));
        } 
        api.setState("userPayload", userPayload);      

        if (processSingleRule) {
            processSelectedRules(identification_rules, true, userPayload); //use passed in userPayload values inside processSelectedRules
        }

        if (selectedTabId == "select_class" && !classHierarchy) {
            markCurrStepDone(leftNavItems, currViewIndex, FORM_ICONS);
            navButtonState['back'].hidden = false;
            api.setState("navButtonState", JSON.parse(JSON.stringify(navButtonState)));
        }
    }
    api.setState("labelTooltips", labelsTooltips);
}
