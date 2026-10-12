function onLoad() {
    g_form.elements
        .filter(function getInputVarFields(element) {
            return element.tableName.startsWith('sys_pd_activity_definition.inputs.') || element.fieldName.startsWith('inputs.');
        })
        .forEach(function setFieldToNotMandatory(element) {
            g_form.setMandatory(element.fieldName, false);
        });
}
