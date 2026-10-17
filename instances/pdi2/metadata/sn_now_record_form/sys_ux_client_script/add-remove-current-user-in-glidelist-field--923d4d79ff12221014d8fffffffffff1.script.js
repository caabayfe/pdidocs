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

    const {
        user: {
            sys_id,
            fullName
        }
    } = api.context.session;

    const referenceField = event.payload.fields.referenceField;
    const referenceFieldData = api.data.glide_form_1.nowRecordFormBlob.fields[referenceField];

    let currentValue = referenceFieldData.value;
    let displayValue = referenceFieldData.displayValue;
    let displayValueList = referenceFieldData.display_value_list;
    let updatedSysId = "";
    let updatedDisplayValue = "";
    if (event.name === "RECORD#REMOVE_CURRENT_USER") {
        // Remove current user from the list
        if (!currentValue.includes(sys_id)) {
            // User does not exists in the glidelist
            return;
        }
        updatedSysId = currentValue.split(",").filter(item => item !== sys_id).join(",");
        const displayValues = displayValueList || displayValue.split(',');
        const index = displayValues.indexOf(fullName.trim());
        if (index !== -1) displayValues.splice(index, 1);
        updatedDisplayValue = displayValues;

    } else if (event.name === "RECORD#ADD_CURRENT_USER") {
        // Add current user to the list
        if (currentValue.includes(sys_id)) {
            // User already exists in the glidelist, no need to add again
            return;
        }
        updatedSysId = currentValue ? `${currentValue},${sys_id}` : sys_id;
        updatedDisplayValue = displayValueList ? [...displayValueList, fullName] : [...displayValue.split(','), fullName];

    }
    api.emit("RECORD#GFORM_SET_VALUE", {
        fieldName: referenceField,
        value: updatedSysId,
        displayValue: updatedDisplayValue
    });
}
