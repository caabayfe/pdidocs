/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    const modalPath = api.context.props.modalPath;
    let sowFormModal = imports["sn_sow_itsm_common.SOWFormModal"]();

    var fields = api.state.fields;
    const changes = api.state.serializedChanges;
    const requiredFields = api.state.requiredFields;
    const eventName = event.name;
    
    const { displayValue, fieldName, value } = event.payload;
    const fieldType = fields[fieldName].type;

    const getObjectIndex = (obj, name) => {
        const len = obj.length;
        if (len == 0) {
            return -1;
        }
        return obj.findIndex((ele) => ele.name == name);
    };

    const setMandatory = (fieldName, value) => {
        if (fields[fieldName]) {
            fields[fieldName]['mandatory'] = value;
        }
    };

    const serializedChanges = () => {
        var serializedChangesOld = [];
        if (changes)
            serializedChangesOld = JSON.parse(changes);

        const index = getObjectIndex(serializedChangesOld, fieldName);

        if (index == -1) {
            serializedChangesOld.push({ ...fields[fieldName],
                displayValue,
                value
            });
        } else {
            serializedChangesOld[index] = { ...fields[fieldName],
                displayValue,
                value
            };
        }
        api.setState('serializedChanges', JSON.stringify(serializedChangesOld));
    };

    const setValueObj = (displayValue, fieldName, value, type) => {
        var field = {};
        field.value = value;

        if (type === 'glide_list' && Array.isArray(displayValue)) {
            field.display_value_list = displayValue;
            field.displayValue = displayValue.join(', ');
        } else {
            field.displayValue = displayValue || value;
            if (fieldName === 'close_notes' || fieldName === 'close_code')
                field.messages = [];
        }
        return field;
    };

    const setValue = () => {
        var fieldUpdated = setValueObj(displayValue, fieldName, value, fieldType);
        fields = { ...fields,
            [fieldName]: { ...fields[fieldName],
                ...fieldUpdated
            }
        };
        let processField = sowFormModal.getProcessFields(modalPath);
        if(typeof processField == "function" && fieldName === "assignment_group" && fields.assigned_to.value && fields.assignment_group.value) {
            var userhasGroupQuery = "user=" +fields.assigned_to.value+ "^group="+ fields.assignment_group.value;
            api.setState('userGroupCheck', userhasGroupQuery);
            
        }
        else if (typeof processField == "function") {
                api.setState('userGroupCheck', null);
                processField(fields, fieldName, value, displayValue, api);
        }
        api.setState("fields", { ...fields,
            [fieldName]: { ...fields[fieldName],
                ...fieldUpdated
            }
        });
    };

    switch (eventName) {
        case 'NOW_RECORD_FORM_SECTION_COLUMN_LAYOUT#SET_VALUE':
            setValue();
            serializedChanges();
            break;
    }
}
