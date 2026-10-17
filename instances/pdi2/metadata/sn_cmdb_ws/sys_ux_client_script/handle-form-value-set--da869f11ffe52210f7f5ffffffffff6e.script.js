/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        isEmpty,
        isEmptyObj,
        validateFieldInput
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const {
        fieldName,
        value, 
        displayValue
    } = event.payload;

    const {
        editMode,
        fieldsMetadata, 
        formData,
        isDirty: prevIsDirty
    } = api.state;

    let fieldData = fieldsMetadata[fieldName];
    const originalValue = fieldData.hasOwnProperty('originalValue') ? fieldData['originalValue'] : (fieldData.value ?? '');
    
    let valid = validateFieldInput(fieldData, value);

    fieldData = {
        ...fieldData,
        originalValue,
        value,
        displayValue,
        isInvalid: (fieldData.mandatory && isEmpty(value)) || !valid
    };

    if(!valid) { 
        let fieldType = fieldData.internalType === "ip_addr" ? "IP Address" :  fieldData.internalType;
        fieldData['messages'] = [{
            message: await helpers.translate("Could not parse {0} as {1}", value, fieldType),
            type: 'error'
        }];
    } else {
        delete fieldData['messages'];
    }

    const valueChanged = !(isEmpty(originalValue) && isEmpty(value)) && originalValue != value;
    
    if(valueChanged && valid) {
        const EDITED_HIGHLIGHTED_LABEL = await helpers.translate("Edited");
        
        fieldData['highlightedValue'] = {
            value: EDITED_HIGHLIGHTED_LABEL,
            colorName: "info",
            variantName: "tertiary"
        };
        formData[fieldName] = isEmpty(value) ? "" : value;
    } else {
        delete fieldData['highlightedValue'];
        delete formData[fieldName];
    }

    const formIsDirty = !isEmptyObj(formData);
    if (prevIsDirty != formIsDirty) {
        const { 
            section : {
                sysId,
                captionDisplay
            }
        } = api.context.props;

        if(editMode) {
            api.emit('EXPLORE_CI_FORM_CONTROLLER#FORM_STATUS_CHANGED', {
                isDirty: formIsDirty,
                sectionId: sysId,
                sectionName: captionDisplay
            });
        }
        
    }
    api.setState('formData', formData);
    api.setState('isDirty', !isEmptyObj(formData));
    api.setState('fieldsMetadata', ({currentValue}) => {
        return {
            ...currentValue,
            [fieldName]: fieldData
        }
    });

    // for all the fields in the formData, extract the values from fieldsMetadata
    const unsavedChanges = Object.keys(formData).reduce((acc, _fieldName) => {
        if (_fieldName == fieldName) {
            acc.push({...fieldData });
        } else {
            const fieldData = fieldsMetadata[_fieldName];
            if (fieldData && !fieldData.isInvalid) {
                acc.push({...fieldData });
            }
        }
        return acc;
    }, []); 

    api.setState('unsavedChanges', unsavedChanges);
}
