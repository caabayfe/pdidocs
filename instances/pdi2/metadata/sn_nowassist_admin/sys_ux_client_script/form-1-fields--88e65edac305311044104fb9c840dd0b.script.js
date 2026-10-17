/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var form = api.data.form_2.form;
    var newfields = {};
    if (form && form.fields) {
        const fields = form.fields;
        for (let key in fields) {
            let attributes = fields[key].dictionary.attributes;
            if (attributes.findIndex((att) => (att.name === "hide_na_var" && att.value == "true")) === -1) {
                newfields[key] = fields[key];
                newfields[key]["mandatory"] = newfields[key].dictionary.isMandatory;
                newfields[key]["readonly"] = true;

                /**
                 * 1. Set display value of a field as the internal value if the display value is empty
                 * 2. For field_list type field, set the `displayValuesWithPath` and the `dependentValue` if empty.
                 * 3. For conditions type field, set the `dependentValue` if its empty.
                 */
                if (!fields[key].displayValue) {
                    newfields[key].displayValue = fields[key].value;
                }

                const fieldType = fields[key].type;
                if (fieldType === 'field_list' || fieldType === 'conditions') {
                    const dependentField = fields[key].dependentField;
                    if (dependentField) {
                        const dependentFieldValue = fields[dependentField].value;
                        if (!fields[key].dependentValue) {
                            newfields[key].dependentValue = dependentFieldValue;
                        }
                    }

                    if (fieldType === 'field_list') {
                        const displayValuesWithPath = fields[key].displayValuesWithPath;
                        if (!displayValuesWithPath || (displayValuesWithPath && !displayValuesWithPath.length)) {
                            newfields[key].displayValuesWithPath = fields[key].displayValue.split(',');
                        }
                    }
                }
            }
        }
    }
    return newfields;
}
