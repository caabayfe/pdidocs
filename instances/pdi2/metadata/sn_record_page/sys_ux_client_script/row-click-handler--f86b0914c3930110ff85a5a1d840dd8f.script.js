/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    let rowPayload;
    const currentValue = api.context.props.currentValue;
    const fieldType = api.context.props.fieldType;
    const newValue = event.payload.row.referenceKeyValue.value;
    const newDisplayValue = event.payload.row.displayValue.value;
    const displayValue = api.context.props.displayValue;
    const displayValueList = api.context.props.displayValueList;
    const getRowClickedPayload = ({ referenceField, value, sys_id, displayValue }) => ({
        referenceField,
        row: {
            referenceKeyValue: {
                value
            },
            sys_id: {
                value: sys_id
            },
            displayValue: {
                value: displayValue
            }
        }
    });

    if (fieldType === "glide_list"){
        let constructedDisplayValue;
        
       if(displayValueList)
           constructedDisplayValue = [...displayValueList, newDisplayValue];
        else
           constructedDisplayValue = displayValue ? [...displayValue.split(','), newDisplayValue] : [newDisplayValue];

        rowPayload = !currentValue.includes(newValue) && getRowClickedPayload({
            referenceField: api.context.props.referenceField,
            value: currentValue ? `${currentValue},${newValue}` : newValue,
            sys_id: event.payload.row.sys_id.value,
            displayValue: constructedDisplayValue
        })
    }
    else
        rowPayload = getRowClickedPayload({
            referenceField: api.context.props.referenceField,
            value: newValue,
            sys_id: event.payload.row.sys_id.value,
            displayValue: newDisplayValue
        });
    if (rowPayload)
        api.emit('REF_PICK#ROW_CLICKED', rowPayload);
}
