function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

g_form.elements
        .filter(function getInputVarFields(element) {
            return element.tableName.startsWith('ga_guidance_action.flow_input_value.') || element.fieldName.startsWith('flow_input_value.');
        })
        .forEach(function setFieldToNotMandatory(element) {
            g_form.setMandatory(element.fieldName, false);
        });

   
}
