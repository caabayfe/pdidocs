/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        buildSuccessNotificationItems,
        buildWarningNotificationItems,
        buildErrorNotificationItems,
        closeEditMode,
        isEmpty,
        SAVED_HIGHLIGHTED_VALUE_ID
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    
    const { result } = api.data.update_ci;
    const {
        status,
        message,
        type,
        maskedAttributes,
        details
    } = result;

    const { unsavedChangesSaveAction } = api.state;
    api.setState('unsavedChangesSaveAction', false); //reset value so we don't accidently auto-navigate in case of error/warning
    
    switch(status) {
        case "WARNING": {
            if(type === "RECONCILIATION_RULE_PREVENTING_UPDATE"){
                const { formDataToSave } = api.state;
                const warningMessage = await helpers.translate('This attribute was not updated due to the application of reconciliation rules specific to this attribute');
                const SAVED_HIGHLIGHTED_LABEL = await helpers.translate("Saved");

                api.setState('maskedAttributes', maskedAttributes);
                api.setState('fieldsMetadata', ({currentValue})=> {
                    const messages = [{
                        message: warningMessage,
                        type: 'warning'
                    }];

                    const savedHighlightedValue = {
                        value: SAVED_HIGHLIGHTED_LABEL,
                        id: SAVED_HIGHLIGHTED_VALUE_ID,
                        colorName: "positive",
                        variantName: "tertiary"
                    };

                    const fieldsMetadataObjEntries = Object.entries(currentValue);
                    const maskedAttrFieldData = Object.fromEntries(
                        fieldsMetadataObjEntries.filter(([field])=> maskedAttributes.includes(field))
                    );
                    const savedAttributesFieldData = Object.fromEntries(
                        fieldsMetadataObjEntries.filter(([field]) => field in formDataToSave && !maskedAttributes.includes(field))
                    );

                    //add warning field messages
                    for (let maskedAttr in maskedAttrFieldData) {
                        maskedAttrFieldData[maskedAttr] = {
                            ...maskedAttrFieldData[maskedAttr],
                            messages
                        };
                    }

                    //add Saved highlighted value to the fields updated
                    for (let savedAttr in savedAttributesFieldData) {
                        savedAttributesFieldData[savedAttr] = {
                            ...savedAttributesFieldData[savedAttr],
                            highlightedValue: savedHighlightedValue
                        };
                    }

                    return {
                        ...currentValue,
                        ...maskedAttrFieldData,
                        ...savedAttributesFieldData
                    };
                });

                //remove the 'Saved' highlighted value after a few seconds
                helpers.timing.setTimeout(() => {
                    api.setState('fieldsMetadata', ({currentValue}) => {
                        const newFieldsMetadata = {};
                        for (let field in currentValue) {
                            const fieldData = currentValue[field];
                            if (fieldData?.highlightedValue?.id === SAVED_HIGHLIGHTED_VALUE_ID) {
                                // Create a new object without highlightedValue
                                const { highlightedValue, ...rest } = fieldData;
                                newFieldsMetadata[field] = { ...rest };
                            } else {
                                // No change needed, but still copy the object
                                newFieldsMetadata[field] = { ...fieldData };
                            }
                        }
                        return newFieldsMetadata;
                    });
                }, 3 * 1000);
            }
            
            const items = buildWarningNotificationItems({
                content: message, 
                id: 'update-ci-warning-message'
            });
            api.emit('EXPLORE_CI_FORM_CONTROLLER#ADD_NOTIFICATIONS', {
                items
            });
            api.emit('EXPLORE_CI_FORM_CONTROLLER#UPDATE_CI_OP_SUCCEEDED'); //will refresh the data
            break;
        }
        case "SUCCESS": {
            const items = buildSuccessNotificationItems({
                content: message, 
                id: 'update-ci-success-message'
            });
            api.emit('EXPLORE_CI_FORM_CONTROLLER#ADD_NOTIFICATIONS', {
                items
            });
            api.emit('EXPLORE_CI_FORM_CONTROLLER#UPDATE_CI_OP_SUCCEEDED'); //will refresh the data

            if(unsavedChangesSaveAction) 
                api.emit('EXPLORE_CI_FORM_CONTROLLER#UNSAVED_CHANGES_HANDLED');

            closeEditMode();

            //clear success notification after 5 seconds
            helpers.timing.setTimeout(() => {
                api.emit('EXPLORE_CI_FORM_CONTROLLER#REMOVE_NOTIFICATIONS', {
                    items
                });
            }, 5 * 1000);
            break;
        }
        case "ERROR": {
            let content = isEmpty(details) ? message : {
                    type: 'html',
                    value: details
                };
            
            const errorNotificationItems = buildErrorNotificationItems({
                content, 
                id: 'update-ci-error-message'
            });
            api.emit('EXPLORE_CI_FORM_CONTROLLER#UPDATE_CI_OP_FAILED', {
                ...result,
                errorNotificationItems
            });
            break;
        }
        default: { //unknown status
            break;
        }
    }
}
