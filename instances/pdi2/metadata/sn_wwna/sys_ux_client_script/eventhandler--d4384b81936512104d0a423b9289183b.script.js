/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    function setHelperText(keyToUpdate, list = [], value) {
        let selectedOptionObj = list.find((obj) => obj.id === value);
        if (selectedOptionObj?.helperText) {
            api.setState(keyToUpdate, selectedOptionObj.helperText);
        }
    }

    function updateVarSetForMultipleRecords(varSetKeys = []) {
        let propsForVarSet = createPayloadForSave(varSetKeys);
        Object.keys(propsForVarSet).forEach((variableKey) => {
            updateVarSet(variableKey, propsForVarSet[variableKey]);
        });
    }


    function updateVarSet(variableName, variableValue) {
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
            eventPayload: {
                sysId: api.state.generalDetails?.sysId,
                variableName: variableName,
                variableValue: variableValue
            }
        });
    }

    function getColumnNameAndLabelMap(columnArray) {
        let columnNameMap = {};
        columnArray.forEach((colObj) => {
            if (colObj?.id) {
                columnNameMap[colObj.id] = colObj.label;
            }
        });
        return columnNameMap;
    }

    function updateColumnList(api, eventPayload) {
        let columnNamesArr = getColumnNameAndLabelMap(eventPayload || []);
        columnNamesArr = Object.keys(columnNamesArr);
        let generalDetails = api.state.generalDetails || {};
        if (!generalDetails.props) {
            generalDetails.props = {};
        }
        generalDetails.props['configured_columns'] = columnNamesArr.join(',');
        api.setState('generalDetails', generalDetails);
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
            eventPayload: {
                sysId: api.state.generalDetails?.sysId,
                variableName: 'configured_columns',
                variableValue: columnNamesArr.join(',')
            }
        });
        api.emit('REFRESH_STATE', {});

    }

    function createPayloadForSave(varSetKeys, fetchAllKeys = false) {
        let propsObj = {};
        let propsKey = new Set(varSetKeys);

        if (propsKey.has('config_type') || fetchAllKeys) {
            propsObj['config_type'] = api.state.configType;
        }

        if (propsKey.has('table') || fetchAllKeys) {
            propsObj['table'] = api.state.selectedTable?.id || api.state.tableName;
        }

        if (propsKey.has('configured_columns') || fetchAllKeys) {
            if (propsObj['config_type'] !== api.state.CONFIG_TYPE.TABLE) {
                propsObj['configured_columns'] = '';
            } else {
                propsObj['configured_columns'] = getColumnNameAndLabelMap(api.state.selectedColumns || []);
            }
        }

        if (propsKey.has('variant') || fetchAllKeys) {
            if (propsObj['config_type'] !== api.state.CONFIG_TYPE.TABLE) {
                propsObj['variant'] = api.state.variantType;
            }

        }

        if (propsKey.has('component_ids') || fetchAllKeys) {
            if (propsObj['config_type'] === api.state.CONFIG_TYPE.TABLE) {
                propsObj['component_ids'] = '';
            } else {
                propsObj['component_ids'] = api.state.componentIds.join(',')
            }
        }
        return propsObj;
    }

    function setVariantTypeAndOptions(configTypeValue, variantTypeList = [], variantTypeValue, variantTypeConfig, configTypeConfig) {
        variantTypeConfig = api.state.VARIANT_TYPE?.DRAGGABLE ? api.state.VARIANT_TYPE : variantTypeConfig;
        configTypeConfig = api.state.CONFIG_TYPE?.SINGLE ? api.state.CONFIG_TYPE : configTypeConfig;
        let valueToSet = variantTypeValue;
        let removeDisableField = false;
        if (configTypeValue === configTypeConfig.SINGLE) {
            api.setState("selectedColumns", []);
            updateColumnList(api, []);
            removeDisableField = true;
        } else if (configTypeValue === configTypeConfig.TABLE) {
            valueToSet = variantTypeConfig.DRAGGABLE;
            api.setState('variantType', valueToSet);
        }
        let helperText = '';
        let listForVariant = api.state.listForVariantType?.length ? api.state.listForVariantType : variantTypeList;
        listForVariant = listForVariant.map((listObj) => {
            if (removeDisableField) {
                delete listObj.disabled;
            } else if (listObj.id !== variantTypeConfig.DRAGGABLE) {
                listObj.disabled = true;
            }

            if (listObj.id === valueToSet) {
                helperText = listObj.helperText;
            }
            return listObj;
        });

        if (helperText) {
            api.setState('helperTextForVariantType', helperText);
        }
        api.setState('listForVariantType', listForVariant);
    }

    switch (event.elementId) {
        case "config_type_radio":
            api.setState('configType', event.payload.value);
            updateVarSet('config_type', event.payload.value);
            setVariantTypeAndOptions(event.payload.value, api.state.listForVariantType, api.state.variantType);
            setHelperText('helperTextForConfigType', api.state.listForConfigType, event.payload.value);
            api.emit('REFRESH_STATE', {});
            break;
        case "variant_type":
            setHelperText('helperTextForVariantType', api.state.listForVariantType, event.payload.value);
            api.emit('REFRESH_STATE', {});
            break;
        case "table_list":
            if (event.name === "NOW_SELECT#SEARCH_TERM_SET") {
                let searchText = event?.payload?.value;
                let searchTerm;
                if (searchText) {
                    searchTerm = `nameLIKE${searchText}^ORlabelLIKE${searchText}`;
                } else {
                    searchTerm = '';
                }
                api.setState('searchTerm', searchTerm);
            } else if (event.name === "NOW_SELECT#SELECTED_ITEM_SET") {
                let selectedTable = event?.payload?.item || {
                    id: ""
                };
                if (api.state.selectedTable.id !== selectedTable.id) {
                    api.setState('selectedColumns', []);
                    updateColumnList(api, []);
                    updateVarSets('configured_columns', '');
                }
                api.setState('selectedTable', selectedTable);
                api.setState('tableName', selectedTable.id);
                api.setState('queryForColumnList', `name=${selectedTable.id}^ORname=${selectedTable.parentTableName}^elementNOT MATCHESsys_%`);
                updateVarSet('table', selectedTable.id);

                updateVarSetForMultipleRecords(['config_type']);
            }
            break;
        case "column_selector_dropdown":
            updateColumnList(api, api.state.selectedColumns);
            break;
        case "component_id_text":
            let tempInputText = event.payload.value;
            api.setState('componentIdText', tempInputText);
            break;
        case "add_component_id":
            let tempComponentIdText = api.state.componentIdText;
            if (!tempComponentIdText) {
                return;
            }
            if (api.state.configType === api.state.CONFIG_TYPE.SINGLE && api.state.componentIds.length === 1) {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: 'single-occurence',
                        status: 'warning',
                        icon: 'circle-info-outline',
                        content: {
                            type: "html",
                            value: 'Only one component ID can be added for a single occurrence. Please remove the existing component ID and add a new one'
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                });
                return;
            }
            let componentIdsArray = api.state.componentIds;
            componentIdsArray.push(tempComponentIdText);
            api.setState('componentIds', [...componentIdsArray]);
            api.setState('componentIdText', '');
            updateVarSet('component_ids', componentIdsArray.join(','));
            break;
        case "component_id_pill":
            let indexToRemove = event.context.item.index;
            let componentIdsPill = api.state.componentIds;
            componentIdsPill.splice(indexToRemove, 1);
            api.setState('componentIds', [...componentIdsPill]);
            updateVarSet('component_ids', componentIdsPill.join(','));
            break;
        case "fetch_table_list":
            let tableOutput = api.data.fetch_table_list.results;
            let tempTableListArr = [];
            tableOutput.forEach((obj) => {
                if (obj['name'].value) {
                    let newObj = {};
                    newObj['id'] = obj['name'].value;
                    newObj['label'] = obj['label'].value;
                    newObj['name'] = obj['name'].value;
                    newObj['parentTableName'] = obj['super_class']?._reference?.name?.value || '';
                    newObj.label = newObj.label + (' (' + newObj.name + ')');
                    tempTableListArr.push(newObj);
                    if (api.state.tableName === newObj['id']) {
                        api.setState('selectedTable', newObj);
                        api.setState('queryForColumnList', `name=${newObj.id}^ORname=${newObj.parentTableName}^elementNOT MATCHESsys_%`);
                    }
                }
            });
            api.setState('tableList', tempTableListArr);
            
            api.emit('REFRESH_STATE', {});
            break;
        case "upsert_new_var_set_records":
            let newRecordsOutput = api.data.upsert_new_var_set_records.output;
            if (newRecordsOutput?.success) {
                validateAndSaveData(newRecordsOutput.guided_context, newRecordsOutput.payload, true, helpers);
            } else if (newRecordsOutput.message) {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: 'upsertNewVarSetRecord',
                        status: 'critical',
                        icon: 'circle-info-outline',
                        content: {
                            type: "html",
                            value: newRecordsOutput.message
                        },
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
            }
            break;
        case "fetch_column_list":
            let tempColumnListByElement = api.data.fetch_column_list.output;
            api.setState('columnList', JSON.parse(JSON.stringify(Object.values(tempColumnListByElement))));
            if (api.state.generalDetails?.props?.configured_columns?.length) {
                let byDefaultSelectedColumns = [];
                api.state.generalDetails.props.configured_columns.split(',').forEach((columnName) => {
                    let indexedColObj = tempColumnListByElement[columnName];
                    if (indexedColObj) {
                        byDefaultSelectedColumns.push(indexedColObj);
                    }
                });
                api.setState('selectedColumns', byDefaultSelectedColumns);
            } else {
                api.setState('selectedColumns', []);
            }
            break;
        case "fetch_configurations":
            let configApiOutput = api.data.fetch_configurations.output;
            if (configApiOutput) {
                api.setState('CONFIG_TYPE', configApiOutput.CONFIG_TYPE);
                api.setState('VARIANT_TYPE', configApiOutput.VARIANT_TYPE);
                api.setState('listForConfigType', configApiOutput.CONFIG_TYPE_LIST);
                api.setState('listForVariantType', configApiOutput.VARIANT_TYPE_LIST);
                let helperTextForVariantTypeUpdated = false;
                if (api.state.configType) {

                    setHelperText('helperTextForConfigType', configApiOutput.CONFIG_TYPE_LIST, api.state.configType);
                    if (api.state.configType === configApiOutput.CONFIG_TYPE.TABLE) {
                        setVariantTypeAndOptions(api.state.configType, configApiOutput.VARIANT_TYPE_LIST, api.state.variantType, configApiOutput.VARIANT_TYPE, configApiOutput.CONFIG_TYPE);
                        helperTextForVariantTypeUpdated = true;
                    }
                }

                if (api.state.variantType && !helperTextForVariantTypeUpdated) {
                    setHelperText('helperTextForVariantType', configApiOutput.VARIANT_TYPE_LIST, api.state.variantType);
                }
            }
            api.emit('REFRESH_STATE', {});
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                action: null,
                nonBlocking: false
            });
            break;
        case "fetch_admin_configurations":
            let adminConfigOutput = api.data.fetch_admin_configurations.output;
            if (adminConfigOutput?.shouldDisableFields) {
                api.setState('fieldsToDisable', adminConfigOutput.fieldToDisable || {});
            }
            break;
        case "skill_config_name":
        case "skill_config_description":
        case "skill_config_order":
            api.emit('ACE_ACTION_PERFORMED', {
                eventName: 'SN_NS_ADMIN_UPDATE_SKILL_GENERAL_DETAILS',
                eventPayload: {
                    name: api.state.skillConfigName,
                    description: api.state.skillConfigDescription,
                    order: api.state.skillConfigOrder
                }
            });
            break;

    }

    async function validateData(props) {
        let result = {
            isValid: true,
            message: ''
        };

        if(!api.state.skillConfigName){
            result.isValid = false;
            result.message = await helpers.translate('Name is a required field');
        } else if (!props.table) {
            result.isValid = false;
            result.message = await helpers.translate('Table name is a required field');
        } else if (api.state.isOrderFieldInvalid){
            result.isValid = false;
            result.message = await helpers.translate('Please enter a valid number for the order field');
        } else if (!props.config_type) {
            result.isValid = false;
            result.message = await helpers.translate('Please select a valid input for how do you want the Now Assist context menu to appear');
        } else if (props.config_type === api.state.CONFIG_TYPE.TABLE && ((typeof props.configured_columns === 'string' && !props.configured_columns) || (typeof props.configured_columns === 'object' && !Object.keys(props.configured_columns).length))) {
            result.isValid = false;
            result.message = await helpers.translate('Please select form fields where you want to enable the Now Assist context menu');
        }

        return result;
    }

    function addNotification(status, message) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: 'nacm-notification',
                status: status || 'info',
                icon: 'circle-info-outline',
                content: {
                    type: "html",
                    value: message
                },
                action: {
                    type: "dismiss"
                },
            }]
        });
    }

    async function validateAndSaveData(guided_context, payload, shouldMoveToNextScreen = false, helpers) {

        if (!shouldMoveToNextScreen) {

            let payloadForSave = createPayloadForSave([], true);
            let variablesToSend = Object.assign(guided_context.variables, payloadForSave);
            let validationResult = await validateData(variablesToSend);
            if (api.state.initialSetupDone && validationResult.isValid) {
                api.setState('payloadForSave', {
                    guided_context: {
                        variables: variablesToSend
                    },
                    payload: payload,
                    skillConfigName: api.state.skillConfigName,
                    skillConfigDescription: api.state.skillConfigDescription,
                    skillConfigOrder: api.state.skillConfigOrder
                });
            } else {
                addNotification('critical', validationResult.message);
            }

        } else {
            updateVarSets(api.state.generalDetails?.sysId, {
                props: guided_context.variables
            });
        }
    }


    function updateVarSets(varSetId, payload) {
        var successMessage = "Changes saved successfully.";
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_SAVE_VAR_SET_DATA',
            eventPayload: {
                varSetId: varSetId,
                moveToNextStep: true,
                payload: payload,
                forceSave: true
            }
        });
    }

    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SN_NS_ADMIN_OVERRIDE_SAVE',
        eventPayload: {
            overrideFunction: validateAndSaveData
        }
    });
}
